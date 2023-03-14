import AdmZip from 'adm-zip';
import axios from 'axios';
import FormData from 'form-data';
import { URL } from 'url';
import { IDBConnection } from '../database/db';
import { HTTP400 } from '../errors/http-error';
import {
  IProjectAttachment,
  IProjectReportAttachment,
  ISurveyAttachment,
  ISurveyReportAttachment
} from '../repositories/attachment-repository';
import { ISurveySummaryDetails } from '../repositories/summary-repository';
import { ISurveyProprietorModel } from '../repositories/survey-repository';
import { getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { AttachmentService } from './attachment-service';
import { DBService } from './db-service';
import { EmlService } from './eml-service';
import { HistoryPublishService } from './history-publish-service';
import { KeycloakService } from './keycloak-service';
import { SummaryService } from './summary-service';
import { SurveyService } from './survey-service';

export interface IArchiveFile {
  /**
   * Raw file data
   */
  data: Buffer;
  /**
   * The name of the archive file.
   */
  fileName: string;
  /**
   * The mime type, should be `application/zip` or similar.
   */
  mimeType: string;
}

export interface IDwCADataset {
  /**
   * A Darwin Core Archive (DwCA) zip file.
   */
  archiveFile: IArchiveFile;
  /**
   * A UUID that uniquely identifies this DwCA dataset.
   */
  dataPackageId: string;

  securityRequest?: ISurveyProprietorModel;
}

export interface IArtifactMetadata {
  file_type: string;
  title: string | null;
  description: string | null;
}

export interface IArtifact {
  /**
   * An artifact zip file.
   */
  archiveFile: IArchiveFile;
  /**
   * UUID that uniquely identifies the artifact
   */
  dataPackageId: string;

  metadata: IArtifactMetadata & {
    file_name: string;
    file_size: string;
  };
}

interface IPublishIds {
  queueId: number | null;
  occurrenceId: number | null;
  summaryInfo: { summaryId: number | null; artifactId: number | null };
}

const defaultLog = getLogger('services/platform-repository');

export class PlatformService extends DBService {
  attachmentService: AttachmentService;
  publishService: HistoryPublishService;
  backboneIntakeEnabled: boolean;
  backboneApiHost: string;
  backboneIntakePath: string;
  backboneArtifactIntakePath: string;

  constructor(connection: IDBConnection) {
    super(connection);

    this.backboneIntakeEnabled = process.env.BACKBONE_INTAKE_ENABLED === 'true' || false;
    this.backboneApiHost = process.env.BACKBONE_API_HOST || '';
    this.backboneIntakePath = process.env.BACKBONE_INTAKE_PATH || '/api/dwc/submission/queue';
    this.backboneArtifactIntakePath = process.env.BACKBONE_ARTIFACT_INTAKE_PATH || '/api/artifact/intake';

    this.publishService = new HistoryPublishService(this.connection);
    this.attachmentService = new AttachmentService(connection);
  }

  /**
   * Submit Surey Data Package to Biohub
   *
   * @param {number} surveyId
   * @param {number} projectId
   * @param {{
   *       observations: IGetObservationSubmissionResponse[];
   *       summary: IGetSummaryResultsResponse[];
   *       reports: IGetSurveyReportAttachment[];
   *       attachments: IGetSurveyAttachment[];
   *     }} data
   * @return {*}  {Promise<void>}
   * @memberof PlatformService
   */
  async submitSurveyDataPackage(
    projectId: number,
    surveyId: number,
    data: {
      observations: IGetObservationSubmissionResponse[];
      summary: IGetSummaryResultsResponse[];
      reports: IGetSurveyReportAttachment[];
      attachments: IGetSurveyAttachment[];
    }
  ): Promise<{ uuid: string }> {
    if (!this.backboneIntakeEnabled) {
      throw new HTTP400('Biohub intake is not enabled');
    }

    const surveyService = new SurveyService(this.connection);
    const emlService = new EmlService({ projectId: projectId }, this.connection);
    const emlString = await emlService.buildProjectEml();

    if (!emlString) {
      throw new HTTP400('emlString failed to build');
    }

    const dwcArchiveZip = new AdmZip();
    dwcArchiveZip.addFile('eml.xml', Buffer.from(emlString));

    //Collect publish ids to insert into history tables
    const publishIds: IPublishIds = {
      queueId: null,
      occurrenceId: null,
      summaryInfo: { summaryId: null, artifactId: null }
    };

    /**
     * Check for observations, if observations are present,
     * then get file from S3 and add to dwcArchiveZip
     */
    if (data.observations.length !== 0) {
      const occurrenceData = await surveyService.getLatestSurveyOccurrenceSubmission(surveyId);
      if (!occurrenceData || !occurrenceData.output_key) {
        throw new HTTP400('no s3Key found');
      }

      publishIds.occurrenceId = occurrenceData.id;

      const s3File = await getFileFromS3(occurrenceData.output_key);
      if (!s3File) {
        throw new HTTP400('no s3File found');
      }

      dwcArchiveZip.addFile(data.observations[0].inputFileName, Buffer.from(s3File.Body as Buffer));
    }

    /**
     * Check for summary, if summary are present,
     * then get file from S3 and submit to biohub as an artifact
     */
    if (data.summary.length !== 0) {
      const summaryService = new SummaryService(this.connection);
      const summaryData = await summaryService.getLatestSurveySummarySubmission(surveyId);

      if (!summaryData || !summaryData.key) {
        throw new HTTP400('no s3Key found');
      }

      publishIds.summaryInfo.summaryId = summaryData.id;

      const summaryArtifact = await this._makeArtifactFromSummary(emlService.packageId, summaryData);
      const { artifact_id } = await this._submitArtifactToBioHub(summaryArtifact);

      publishIds.summaryInfo.artifactId = artifact_id;
    }

    /**
     * Check for report, if report are present,
     * then submit all reports to biohub as an artifact
     */
    if (data.reports.length !== 0) {
      const reportIds = data.reports.map((report) => report.id);
      await this.uploadSurveyReportAttachmentsToBioHub(emlService.packageId, projectId, reportIds);
    }

    /**
     * Check for attachments, if attachments are present,
     * then submit all attachments to biohub as an artifact
     */
    if (data.attachments.length !== 0) {
      const attachmentIds = data.attachments.map((attachment) => attachment.id);
      await this.uploadSurveyAttachmentsToBioHub(emlService.packageId, projectId, attachmentIds);
    }

    //Check security request and create DWCA file for submission
    const securityRequest = await surveyService.getSurveyProprietorDataForSecurityRequest(surveyId);
    const dwCADataset: IDwCADataset = {
      archiveFile: {
        data: dwcArchiveZip.toBuffer(),
        fileName: `${emlService.packageId}.zip`,
        mimeType: 'application/zip'
      },
      dataPackageId: emlService.packageId,
      securityRequest
    };

    //Submit DWCA file to biohub
    const queueResponse = await this._submitDwCADatasetToBioHubBackbone(dwCADataset);
    publishIds.queueId = queueResponse.queue_id;

    //Publish Survey records to history
    await this.publishSurveyHistory(surveyId, publishIds);

    //Pulish Project Metadata records to history
    await this.publishService.insertProjectMetadataPublishRecord({
      project_id: projectId,
      queue_id: publishIds.queueId
    });

    return { uuid: emlService.packageId };
  }

  /**
   * Publishes the history of the Survey submission to the database
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {publishIds} publishIds
   * @memberof PlatformService
   */
  async publishSurveyHistory(surveyId: number, publishIds: IPublishIds) {
    const publishArray = [];
    if (publishIds.queueId) {
      publishArray.push(
        this.publishService.insertSurveyMetadataPublishRecord({
          survey_id: surveyId,
          queue_id: publishIds.queueId
        })
      );

      if (publishIds.occurrenceId) {
        publishArray.push(
          this.publishService.insertOccurrenceSubmissionPublishRecord({
            occurrence_submission_id: publishIds.occurrenceId,
            queue_id: publishIds.queueId
          })
        );
      }
    }

    if (publishIds.summaryInfo && publishIds.summaryInfo.summaryId && publishIds.summaryInfo.artifactId) {
      publishArray.push(
        this.publishService.insertSurveySummaryPublishRecord({
          survey_summary_submission_id: publishIds.summaryInfo.summaryId,
          artifact_id: publishIds.summaryInfo.artifactId
        })
      );
    }

    await Promise.all([publishArray]);
  }

  /**
   * Submit a Darwin Core Archive (DwCA) data package, that only contains the project/survey metadata, to the BioHub
   * Platform Backbone.
   *
   * Why submit only metadata? It is beneficial to submit the metadata as early as possible, so that the project/survey
   * is discoverable by users of BioHub, even if the project/survey has not yet completed or not all inventory data has
   * been submitted.
   *
   * Note: Does nothing if `process.env.BACKBONE_INTAKE_ENABLED` is not `true`.
   *
   * @param {number} projectId
   * @return {*} Promise<{queue_id: number} | undefined>
   * @memberof PlatformService
   */
  async submitDwCAMetadataPackage(projectId: number): Promise<{ queue_id: number } | undefined> {
    try {
      if (!this.backboneIntakeEnabled) {
        return;
      }

      const emlService = new EmlService(this.connection);
      const emlPackage = await emlService.buildProjectEmlPackage({ projectId });
      const emlString = emlPackage.toString();

      defaultLog.debug({ label: 'submitDwCAMetadataPackage' });

      const dwcArchiveZip = new AdmZip();
      dwcArchiveZip.addFile('eml.xml', Buffer.from(emlString));

      const dwCADataset = {
        archiveFile: {
          data: dwcArchiveZip.toBuffer(),
          fileName: 'DwCA.zip',
          mimeType: 'application/zip'
        },
        dataPackageId: emlPackage.packageId
      };

      return this._submitDwCADatasetToBioHubBackbone(dwCADataset);
    } catch (error) {
      // Don't fail the rest of the endpoint if submitting metadata fails
      defaultLog.error({ label: 'platformService->submitDwCAMetadataPackage', message: 'error', error });
    }
  }

  /**
   * Submit a Darwin Core Archive (DwCA) data package, that contains both project/survey metadata and survey occurrence
   * data, to the BioHub Platform Backbone.
   *
   * Note: Does nothing if `process.env.BACKBONE_INTAKE_ENABLED` is not `true`.
   *
   * @param {number} projectId
   * @return {*}
   * @memberof PlatformService
   */
  async submitDwCADataPackage(projectId: number): Promise<{ queue_id: number } | void> {
    if (!this.backboneIntakeEnabled) {
      return;
    }

    const emlService = new EmlService(this.connection);
    const emlPackage = await emlService.buildProjectEmlPackage({ projectId });

    const dwcArchiveZip = new AdmZip();
    dwcArchiveZip.addFile('eml.xml', Buffer.from(emlPackage.toString()));
    // TODO fetch and add DwCA data files to archive

    const dwCADataset = {
      archiveFile: {
        data: dwcArchiveZip.toBuffer(),
        fileName: 'DwCA.zip',
        mimeType: 'application/zip'
      },
      dataPackageId: emlPackage.packageId
    };

    return this._submitDwCADatasetToBioHubBackbone(dwCADataset);
  }

  /**
   * Submit a new Darwin Core Archive (DwCA) data package to the BioHub Platform Backbone.
   *
   * @param {IDwCADataset} dwcaDataset
   * @return {*}  {Promise<{ data_package_id: string }>}
   * @memberof PlatformService
   */
  async _submitDwCADatasetToBioHubBackbone(dwcaDataset: IDwCADataset): Promise<{ queue_id: number }> {
    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakToken();

    const formData = new FormData();

    formData.append('media', dwcaDataset.archiveFile.data, {
      filename: dwcaDataset.archiveFile.fileName,
      contentType: dwcaDataset.archiveFile.mimeType
    });

    formData.append('data_package_id', dwcaDataset.dataPackageId);

    if (dwcaDataset.securityRequest) {
      formData.append('security_request[first_nations_id]', dwcaDataset.securityRequest.first_nations_id || 0);
      formData.append('security_request[proprietor_type_id]', dwcaDataset.securityRequest.proprietor_type_id || 0);
      formData.append('security_request[survey_id]', dwcaDataset.securityRequest.survey_id);
      formData.append('security_request[rational]', dwcaDataset.securityRequest.rational || '');
      formData.append('security_request[proprietor_name]', dwcaDataset.securityRequest.proprietor_name || '');
      formData.append('security_request[disa_required]', `${dwcaDataset.securityRequest.disa_required}`);
    }

    const backboneIntakeUrl = new URL(this.backboneIntakePath, this.backboneApiHost).href;

    const { data } = await axios.post<{ queue_id: number }>(backboneIntakeUrl, formData.getBuffer(), {
      headers: {
        authorization: `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });
    return data;
  }

  /**
   * Upload Survey/Project/Observation data to Backbone
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*} {Promise<void>}
   * @memberof PlatformService
   */
  async uploadSurveyDataToBioHub(projectId: number, surveyId: number): Promise<void> {
    if (!this.backboneIntakeEnabled) {
      return;
    }

    const surveyService = new SurveyService(this.connection);
    const surveyData = await surveyService.getLatestSurveyOccurrenceSubmission(surveyId);
    const securityRequest = await surveyService.getSurveyProprietorDataForSecurityRequest(surveyId);

    if (!surveyData || !surveyData.output_key) {
      throw new HTTP400('no s3Key found');
    }

    const s3File = await getFileFromS3(surveyData.output_key);

    if (!s3File) {
      throw new HTTP400('no s3File found');
    }

    const dwcArchiveZip = new AdmZip(s3File.Body as Buffer);

    const emlService = new EmlService(this.connection);
    const emlPackage = await emlService.buildProjectEmlPackage({ projectId });
    const projectEmlString = emlPackage.toString();

    const surveyEmlPackage = await emlService.buildSurveyEmlPackage({ surveyId });
    const surveyEmlString = surveyEmlPackage.toString();

    defaultLog.debug({ label: 'uploadSurveyDataToBioHub', projectEmlString, surveyEmlString });

    if (!projectEmlString) {
      throw new HTTP400('EML string failed to build');
    }

    dwcArchiveZip.addFile('eml.xml', Buffer.from(projectEmlString));

    const dwCADataset: IDwCADataset = {
      archiveFile: {
        data: dwcArchiveZip.toBuffer(),
        fileName: `${emlPackage.packageId}.zip`,
        mimeType: 'application/zip'
      },
      dataPackageId: emlPackage.packageId,
      securityRequest
    };

    const queueResponse = await this._submitDwCADatasetToBioHubBackbone(dwCADataset);

    await Promise.all([
      this.publishService.insertProjectMetadataPublishRecord({
        project_id: projectId,
        queue_id: queueResponse.queue_id
      }),
      this.publishService.insertSurveyMetadataPublishRecord({
        survey_id: surveyId,
        queue_id: queueResponse.queue_id
      }),
      this.publishService.insertOccurrenceSubmissionPublishRecord({
        occurrence_submission_id: surveyData.id,
        queue_id: queueResponse.queue_id
      })
    ]);
  }

  /**
   * Submits DwCA Metadata and publishes project data
   * and survey metadata if a survey ID is provided
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @returns {*} Promise<void>
   * @memberof PlatformService
   */
  async submitAndPublishDwcAMetadata(projectId: number, surveyId?: number): Promise<void> {
    try {
      const queueResponse = await this.submitDwCAMetadataPackage(projectId);
      const historyPublishService = new HistoryPublishService(this.connection);

      // take queue id and insert into history publish table
      if (queueResponse?.queue_id) {
        await historyPublishService.insertProjectMetadataPublishRecord({
          project_id: projectId,
          queue_id: queueResponse.queue_id
        });
      }

      // take queue id and insert into history publish table
      if (queueResponse?.queue_id && surveyId) {
        await historyPublishService.insertSurveyMetadataPublishRecord({
          survey_id: surveyId,
          queue_id: queueResponse.queue_id
        });
      }
    } catch (error) {
      // Don't fail the rest of the endpoint if submitting metadata fails
      defaultLog.error({ label: 'platformService->submitAndPublishDwcAMetadata', message: 'error', error });
    }
  }

  /**
   * Makes artifact objects from the given attachment records.
   *
   * @param {IAttachment[]} attachments The attachment records
   * @param {string} dataPackageId The dataPackageId for the artifacts
   * @returns {*} {Promise<IArtifact[]>} The artifact objects
   *
   * @memberof PlatformService
   */
  async _makeArtifactFromAttachment(data: {
    dataPackageId: string;
    attachment: IProjectAttachment | ISurveyAttachment | IProjectReportAttachment | ISurveyReportAttachment;
    file_type: string;
  }): Promise<IArtifact> {
    const { dataPackageId, attachment, file_type } = data;
    const s3File = await getFileFromS3(attachment.key);
    const artifactZip = new AdmZip();
    artifactZip.addFile(attachment.file_name, s3File.Body as Buffer);

    return {
      dataPackageId,
      archiveFile: {
        data: artifactZip.toBuffer(),
        fileName: `${attachment.uuid}.zip`,
        mimeType: 'application/zip'
      },
      metadata: {
        file_name: attachment.file_name,
        file_size: attachment.file_size,
        file_type,
        title: attachment.title,
        description: attachment.description
      }
    };
  }

  /**
   * Makes artifact objects from the given summary data.
   *
   * @param {string} dataPackageId
   * @param {ISurveySummaryDetails} summaryData
   * @return {*}  {Promise<IArtifact>}
   * @memberof PlatformService
   */
  async _makeArtifactFromSummary(dataPackageId: string, summaryData: ISurveySummaryDetails): Promise<IArtifact> {
    const s3File = await getFileFromS3(summaryData.key);
    const artifactZip = new AdmZip();
    artifactZip.addFile(summaryData.file_name, s3File.Body as Buffer);

    const artifact: IArtifact = {
      dataPackageId,
      archiveFile: {
        data: artifactZip.toBuffer(),
        fileName: `${summaryData.uuid}.zip`,
        mimeType: 'application/zip'
      },
      metadata: {
        file_name: summaryData.file_name,
        file_size: String(s3File.ContentLength),
        file_type: 'Summary',
        title: summaryData.file_name,
        description: summaryData.message
      }
    };

    return artifact;
  }

  /**
   * Makes a request to the BioHub API to submit an artifact.
   *
   * @param {IArtifact} artifact The artifact to submit to BioHub
   * @returns {*} {Promise<{artifact_id: number>}} The ID belonging to the artifact record in BioHub
   *
   * @memberof PlatformService
   */
  async _submitArtifactToBioHub(artifact: IArtifact): Promise<{ artifact_id: number }> {
    defaultLog.debug({ label: '_submitArtifactToBioHub', metadata: artifact.metadata });

    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakToken();

    const formData = new FormData();

    formData.append('media', artifact.archiveFile.data, {
      filename: artifact.archiveFile.fileName,
      contentType: artifact.archiveFile.mimeType
    });

    formData.append('data_package_id', artifact.dataPackageId);

    Object.entries(artifact.metadata).forEach(([metadataKey, metadataValue]) => {
      if (metadataValue !== undefined && metadataValue !== null) {
        formData.append(`metadata[${metadataKey}]`, metadataValue);
      }
    });

    const backboneArtifactIntakeUrl = new URL(this.backboneArtifactIntakePath, this.backboneApiHost).href;

    const { data } = await axios.post<{ artifact_id: number }>(backboneArtifactIntakeUrl, formData.getBuffer(), {
      headers: {
        authorization: `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    return data;
  }

  /**
   * Uploads the given project attachments to BioHub.
   *
   * @param {string} dataPackageId The dataPackageId for the artifact submission
   * @param {number} projectId The ID of the project
   * @param {number[]} attachmentIds The particular IDs of the attachments to submit to BioHub
   * @returns {*} {Promise<{artifact_id: number}[]>} The IDs of all the artifact records in BioHub
   *
   * @memberof PlatformService
   */
  async uploadProjectAttachmentsToBioHub(
    dataPackageId: string,
    projectId: number,
    attachmentIds: number[]
  ): Promise<{ project_attachment_publish_id: number }[]> {
    const attachments = await this.attachmentService.getProjectAttachmentsByIds(projectId, attachmentIds);

    const attachmentArtifactPublishRecords = await Promise.all(
      attachments.map(async (attachment) => {
        const artifact = await this._makeArtifactFromAttachment({
          dataPackageId,
          attachment,
          file_type: attachment.file_type || 'Other'
        });
        const { artifact_id } = await this._submitArtifactToBioHub(artifact);

        return this.publishService.insertProjectAttachmentPublishRecord({
          artifact_id,
          project_attachment_id: attachment.id
        });
      })
    );

    return attachmentArtifactPublishRecords;
  }

  /**
   * Uploads the given project report attachments to BioHub.
   *
   * @param {string} dataPackageId The dataPackageId for the artifact submission
   * @param {number} projectId The ID of the project
   * @param {number[]} reportAttachmentIds The particular IDs of the report attachments to submit to BioHub
   * @returns {*} {Promise<{artifact_id: number}[]>} The IDs of all the artifact records in BioHub
   *
   * @memberof PlatformService
   */
  async uploadProjectReportAttachmentsToBioHub(
    dataPackageId: string,
    projectId: number,
    reportAttachmentIds: number[]
  ): Promise<{ project_report_publish_id: number }[]> {
    const reportAttachments = await this.attachmentService.getProjectReportAttachmentsByIds(
      projectId,
      reportAttachmentIds
    );

    const reportArtifactPublishRecords = await Promise.all(
      reportAttachments.map(async (attachment) => {
        const artifact = await this._makeArtifactFromAttachment({ dataPackageId, attachment, file_type: 'Report' });
        const { artifact_id } = await this._submitArtifactToBioHub(artifact);

        return this.publishService.insertProjectReportPublishRecord({
          artifact_id,
          project_report_attachment_id: attachment.id
        });
      })
    );

    return reportArtifactPublishRecords;
  }

  /**
   * Uploads the given survey attachments to BioHub.
   *
   * @param {string} dataPackageId The dataPackageId for the artifact submission
   * @param {number} surveyId The ID of the survey
   * @param {number[]} attachmentIds The particular IDs of the attachments to submit to BioHub
   * @returns {*} {Promise<{artifact_id: number}[]>} The IDs of all the artifact records in BioHub
   *
   * @memberof PlatformService
   */
  async uploadSurveyAttachmentsToBioHub(
    dataPackageId: string,
    surveyId: number,
    attachmentIds: number[]
  ): Promise<{ survey_attachment_publish_id: number }[]> {
    const attachments = await this.attachmentService.getSurveyAttachmentsByIds(surveyId, attachmentIds);

    const attachmentArtifactPublishRecords = await Promise.all(
      attachments.map(async (attachment) => {
        const artifact = await this._makeArtifactFromAttachment({
          dataPackageId,
          attachment,
          file_type: attachment.file_type || 'Other'
        });
        const { artifact_id } = await this._submitArtifactToBioHub(artifact);

        return this.publishService.insertSurveyAttachmentPublishRecord({
          artifact_id,
          survey_attachment_id: attachment.id
        });
      })
    );

    return attachmentArtifactPublishRecords;
  }

  /**
   * Uploads the given survey report attachments to BioHub.
   *
   * @param {string} dataPackageId The dataPackageId for the artifact submission
   * @param {number} surveyId The ID of the survey
   * @param {number[]} reportAttachmentIds The particular IDs of the report attachments to submit to BioHub
   * @returns {*} {Promise<{artifact_id: number}[]>} The IDs of all the artifact records in BioHub
   *
   * @memberof PlatformService
   */
  async uploadSurveyReportAttachmentsToBioHub(
    dataPackageId: string,
    surveyId: number,
    reportAttachmentIds: number[]
  ): Promise<{ survey_report_publish_id: number }[]> {
    const reportAttachments = await this.attachmentService.getSurveyReportAttachmentsByIds(
      surveyId,
      reportAttachmentIds
    );

    const reportArtifactPublishRecords = await Promise.all(
      reportAttachments.map(async (attachment) => {
        const artifact = await this._makeArtifactFromAttachment({ dataPackageId, attachment, file_type: 'Report' });
        const { artifact_id } = await this._submitArtifactToBioHub(artifact);

        return this.publishService.insertSurveyReportPublishRecord({
          artifact_id,
          survey_report_attachment_id: attachment.id
        });
      })
    );

    return reportArtifactPublishRecords;
  }
}

//Interfaces for publishing to backbone
type ObservationSubmissionMessageSeverityLabel = 'Notice' | 'Error' | 'Warning';
export interface IGetObservationSubmissionResponse {
  id: number;
  inputFileName: string;
  status?: string;
  isValidating: boolean;
  messageTypes: {
    severityLabel: ObservationSubmissionMessageSeverityLabel;
    messageTypeLabel: string;
    messageStatus: string;
    messages: { id: number; message: string }[];
  }[];
}

export interface IGetSummaryResultsResponse {
  id: number;
  fileName: string;
  messages: {
    id: number;
    class: string;
    type: string;
    message: string;
  }[];
}

export interface IGetSurveyAttachment {
  id: number;
  fileName: string;
  fileType: string;
  lastModified: string;
  size: number;
  revisionCount: number;
}

export type IGetSurveyReportAttachment = IGetSurveyAttachment & { fileType: 'Report' };
