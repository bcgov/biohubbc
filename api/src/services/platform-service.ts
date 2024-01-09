import AdmZip from 'adm-zip';
import axios from 'axios';
import FormData from 'form-data';
import { Feature, FeatureCollection } from 'geojson';
import { URL } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { IDBConnection } from '../database/db';
import { ApiError, ApiErrorType, ApiGeneralError } from '../errors/api-error';
import { PostSurveySubmissionToBioHubObject } from '../models/biohub-create';
import {
  IProjectAttachment,
  IProjectReportAttachment,
  ISurveyAttachment,
  ISurveyReportAttachment
} from '../repositories/attachment-repository';
import { ISurveySummaryDetails } from '../repositories/summary-repository';
import { IGetLatestSurveyOccurrenceSubmission, ISurveyProprietorModel } from '../repositories/survey-repository';
import { getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { AttachmentService } from './attachment-service';
import { DBService } from './db-service';
import { EmlPackage, EmlService } from './eml-service';
import { HistoryPublishService } from './history-publish-service';
import { KeycloakService } from './keycloak-service';
import { ObservationService } from './observation-service';
import { SummaryService } from './summary-service';
import { SurveyService } from './survey-service';

const defaultLog = getLogger('services/platform-repository');

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

export interface IGetObservationSubmissionResponse {
  id: number;
  inputFileName: string;
  status?: string;
  isValidating: boolean;
  messageTypes: {
    severityLabel: 'Notice' | 'Error' | 'Warning';
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

const getBackboneIntakeEnabled = () => process.env.BACKBONE_INTAKE_ENABLED === 'true' || false;
const getBackboneApiHost = () => process.env.BACKBONE_API_HOST || '';
const getBackboneArtifactIntakePath = () => process.env.BACKBONE_ARTIFACT_INTAKE_PATH || '/api/artifact/intake';
const getBackboneArtifactDeletePath = () => process.env.BACKBONE_ARTIFACT_DELETE_PATH || '/api/artifact/delete';
const getBackboneDwcIntakePath = () => process.env.BACKBONE_INTAKE_PATH || '/api/dwc/submission/queue';
const getBackboneSurveyIntakePath = () => process.env.BACKBONE_DATASET_INTAKE_PATH || '/api/dataset/intake';

export class PlatformService extends DBService {
  attachmentService: AttachmentService;
  historyPublishService: HistoryPublishService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.historyPublishService = new HistoryPublishService(this.connection);
    this.attachmentService = new AttachmentService(connection);
  }

  /**
   * Submit a Darwin Core Archive (DwCA) data package, that only contains the project metadata to the BioHub Platform
   * Backbone.
   *
   * Why submit only metadata? It is beneficial to submit the metadata as early as possible, so that the project is
   * discoverable by users of BioHub, even if the project has not yet completed or not all inventory data has
   * been submitted.
   *
   * @param {number} projectId
   * @return {*}  {Promise<void>}
   * @throws if `process.env.BACKBONE_INTAKE_ENABLED` is not `true`
   * @memberof PlatformService
   */
  async submitProjectDwCMetadataToBioHub(projectId: number): Promise<void> {
    if (!getBackboneIntakeEnabled()) {
      throw new ApiGeneralError('BioHub intake is not enabled');
    }

    const emlService = new EmlService(this.connection);
    const emlPackage = await emlService.buildProjectEmlPackage({ projectId });
    const emlString = emlPackage.toString();

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

    const response = await this._submitDwCADatasetToBioHub(dwCADataset);

    // take queue id and insert into history publish table
    await this.historyPublishService.insertProjectMetadataPublishRecord({
      project_id: projectId,
      queue_id: response.queue_id
    });
  }

  /**
   * Submit a Darwin Core Archive (DwCA) data package, that only contains the survey metadata to the BioHub Platform
   * Backbone.
   *
   * Why submit only metadata? It is beneficial to submit the metadata as early as possible, so that the survey is
   * discoverable by users of BioHub, even if the survey has not yet completed or not all inventory data has
   * been submitted.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<void>}
   * @throws if `process.env.BACKBONE_INTAKE_ENABLED` is not `true`
   * @memberof PlatformService
   */
  async submitSurveyDwCMetadataToBioHub(surveyId: number): Promise<void> {
    if (!getBackboneIntakeEnabled()) {
      throw new ApiGeneralError('BioHub intake is not enabled');
    }

    const emlService = new EmlService(this.connection);
    const emlPackage = await emlService.buildSurveyEmlPackage({ surveyId });
    const emlString = emlPackage.toString();

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

    const response = await this._submitDwCADatasetToBioHub(dwCADataset);

    // Insert publish history record
    await this.historyPublishService.insertSurveyMetadataPublishRecord({
      survey_id: surveyId,
      queue_id: response.queue_id
    });
  }

  /**
   * Submit Project data to Biohub Backbone.
   *
   * @param {number} projectId
   * @param {{
   *       reports: IGetSurveyReportAttachment[];
   *       attachments: IGetSurveyAttachment[];
   *     }} data
   * @return {*}  {Promise<{ uuid: string }>}
   * @memberof PlatformService
   */
  async submitProjectDataToBioHub(
    projectId: number,
    data: {
      reports: IGetSurveyReportAttachment[];
      attachments: IGetSurveyAttachment[];
    }
  ): Promise<{ uuid: string }> {
    if (!getBackboneIntakeEnabled()) {
      throw new ApiGeneralError('BioHub intake is not enabled');
    }

    const emlService = new EmlService(this.connection);

    // Build dataset EML
    const emlPackage = await emlService.buildProjectEmlPackage({ projectId });

    /**
     * Check for report, if report are present, then submit all reports to BioHub as an artifact
     */
    if (data.reports.length !== 0) {
      const reportIds = data.reports.map((report) => report.id);
      await this.submitProjectReportAttachmentsToBioHub(emlPackage.packageId, projectId, reportIds);
    }

    /**
     * Check for attachments, if attachments are present, then submit all attachments to BioHub as an artifact
     */
    if (data.attachments.length !== 0) {
      const attachmentIds = data.attachments.map((attachment) => attachment.id);
      await this.submitProjectAttachmentsToBioHub(emlPackage.packageId, projectId, attachmentIds);
    }

    return { uuid: emlPackage.packageId };
  }

  /**
   * Submit survey ID to BioHub.
   *
   * @param {number} surveyId
   * @param {{ additionalInformation: string }} data
   * @return {*}  {Promise<{ submission_id: number }>}
   * @memberof PlatformService
   */
  async submitSurveyToBioHub(
    surveyId: number,
    data: { additionalInformation: string }
  ): Promise<{ submission_id: number }> {
    defaultLog.debug({ label: 'submitSurveyToBioHub', message: 'params', surveyId });

    if (!getBackboneIntakeEnabled()) {
      throw new ApiGeneralError('BioHub intake is not enabled');
    }

    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakServiceToken();

    const backboneSurveyIntakeUrl = new URL(getBackboneSurveyIntakePath(), getBackboneApiHost()).href;

    const surveyDataPackage = await this.generateSurveyDataPackage(surveyId, data.additionalInformation);

    const response = await axios.post<{ submission_id: number }>(backboneSurveyIntakeUrl, surveyDataPackage, {
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    if (!response.data) {
      throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to submit survey ID to Biohub');
    }

    // Insert publish history record

    // NOTE: this is a temporary solution to get the queue_id into the publish history table
    //      the queue_id is not returned from the survey intake endpoint, so we are using the submission_id
    //      as a temporary solution
    await this.historyPublishService.insertSurveyMetadataPublishRecord({
      survey_id: surveyId,
      queue_id: response.data.submission_id
    });

    return response.data;
  }

  /**
   * Generate survey data package to submit to BioHub.
   *
   * @param {number} surveyId
   * @param {string} additionalInformation
   * @return {*}  {Promise<PostSurveySubmissionToBioHubObject>}
   * @memberof PlatformService
   */
  async generateSurveyDataPackage(
    surveyId: number,
    additionalInformation: string
  ): Promise<PostSurveySubmissionToBioHubObject> {
    const observationService = new ObservationService(this.connection);
    const surveyService = new SurveyService(this.connection);

    const survey = await surveyService.getSurveyData(surveyId);
    const { surveyObservations } = await observationService.getSurveyObservationsWithSupplementaryData(surveyId);
    const surveyLocation = await surveyService.getSurveyLocationsData(surveyId);

    const geometryFeatureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: surveyLocation.flatMap((location) => location.geojson as Feature[])
    };

    const surveyDataPackage = new PostSurveySubmissionToBioHubObject(
      survey,
      surveyObservations,
      geometryFeatureCollection,
      additionalInformation
    );

    return surveyDataPackage;
  }

  /**
   * Submit survey data to BioHub.
   *
   * @param {number} surveyId
   * @param {{
   *       observations: IGetObservationSubmissionResponse[];
   *       summary: IGetSummaryResultsResponse[];
   *       reports: IGetSurveyReportAttachment[];
   *       attachments: IGetSurveyAttachment[];
   *     }} data The survey data to submit to BioHub. WIll skip empty arrays.
   * @return {*}  {Promise<{ uuid: string }>}
   * @throws if `process.env.BACKBONE_INTAKE_ENABLED` is not `true`
   * @memberof PlatformService
   */
  async submitSurveyDataToBioHub(
    surveyId: number,
    data: {
      observations: IGetObservationSubmissionResponse[];
      summary: IGetSummaryResultsResponse[];
      reports: IGetSurveyReportAttachment[];
      attachments: IGetSurveyAttachment[];
    }
  ): Promise<{ uuid: string }> {
    if (!getBackboneIntakeEnabled()) {
      throw new ApiGeneralError('BioHub intake is not enabled');
    }

    const emlService = new EmlService(this.connection);

    // Build dataset EML
    const emlPackage = await emlService.buildSurveyEmlPackage({ surveyId });

    /**
     * Check for observations, if observations are present, then get file from S3, add to dwcArchiveZip, and submit
     * to BioHub
     */
    if (data.observations.length) {
      await this.submitSurveyDwCArchiveToBioHub(surveyId, emlPackage);
      await this.submitSurveyObservationInputDataToBiohub(surveyId, emlPackage.packageId);
    }

    /**
     * Check for summary, if summary are present, then submit survey summary submission to BioHub as an artifact
     */
    if (data.summary.length !== 0) {
      await this.submitSurveySummarySubmissionToBioHub(emlPackage.packageId, surveyId);
    }

    /**
     * Check for report, if report are present, then submit all reports to BioHub as an artifact
     */
    if (data.reports.length !== 0) {
      const reportIds = data.reports.map((report) => report.id);
      await this.submitSurveyReportAttachmentsToBioHub(emlPackage.packageId, surveyId, reportIds);
    }

    /**
     * Check for attachments, if attachments are present, then submit all attachments to BioHub as an artifact
     */
    if (data.attachments.length !== 0) {
      const attachmentIds = data.attachments.map((attachment) => attachment.id);
      await this.submitSurveyAttachmentsToBioHub(emlPackage.packageId, surveyId, attachmentIds);
    }

    return { uuid: emlPackage.packageId };
  }

  /**
   * Submit a darwin core archive dataset to BioHub containing Survey metadata (EML) and occurrence data (DwC).
   *
   * @param {number} surveyId
   * @param {EmlPackage} emlPackage
   * @memberof PlatformService
   */
  async submitSurveyDwCArchiveToBioHub(surveyId: number, emlPackage: EmlPackage) {
    const dwcArchiveZip = new AdmZip();

    // Add eml to archive
    const emlString = emlPackage.toString();
    dwcArchiveZip.addFile('eml.xml', Buffer.from(emlString));

    // Get DwC occurrence data
    const surveyService = new SurveyService(this.connection);
    const occurrenceSubmission = await surveyService.getLatestSurveyOccurrenceSubmission(surveyId);
    if (!occurrenceSubmission || !occurrenceSubmission.output_key) {
      throw new ApiGeneralError('Failed to submit survey to BioHub', ['Occurrence record has invalid s3 output key']);
    }
    const s3File = await getFileFromS3(occurrenceSubmission.output_key);
    if (!s3File) {
      throw new ApiGeneralError('Failed to submit survey to BioHub', ['Failed to fetch occurrence file form S3']);
    }

    // Add all DwC occurrence data files to dwcArchive
    const transformedTemplateZip = new AdmZip(Buffer.from(s3File.Body as Buffer));
    transformedTemplateZip.getEntries().forEach((entry) => {
      if (entry.isDirectory) {
        return;
      }
      dwcArchiveZip.addFile(entry.name, entry.getData());
    });

    // Get security request object
    const securityRequest = await surveyService.getSurveyProprietorDataForSecurityRequest(surveyId);

    // Build DwCA dataset object
    const dwCADataset: IDwCADataset = {
      archiveFile: {
        data: dwcArchiveZip.toBuffer(),
        fileName: `${emlPackage.packageId}.zip`,
        mimeType: 'application/zip'
      },
      dataPackageId: emlPackage.packageId,
      securityRequest
    };

    // Submit DwCA dataset to BioHub
    const response = await this._submitDwCADatasetToBioHub(dwCADataset);

    // Insert publish history record
    await this.historyPublishService.insertSurveyMetadataPublishRecord({
      survey_id: surveyId,
      queue_id: response.queue_id
    });

    // Insert publish history record
    await this.historyPublishService.insertOccurrenceSubmissionPublishRecord({
      occurrence_submission_id: occurrenceSubmission.occurrence_submission_id,
      queue_id: response.queue_id
    });
  }

  /**
   * Submit a new Darwin Core Archive (DwCA) data package to the BioHub Platform Backbone.
   * This package includes survey metadata (EML) and occurrence data (DwC).
   *
   * @param {IDwCADataset} dwcaDataset
   * @return {*}  {Promise<{ queue_id: number }>}
   * @memberof PlatformService
   */
  async _submitDwCADatasetToBioHub(dwcaDataset: IDwCADataset): Promise<{ queue_id: number }> {
    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakServiceToken();

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

    const backboneIntakeUrl = new URL(getBackboneDwcIntakePath(), getBackboneApiHost()).href;

    const { data } = await axios.post<{ queue_id: number }>(backboneIntakeUrl, formData.getBuffer(), {
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
   * @return {*}  {Promise<{ project_attachment_publish_id: number }[]>} The IDs of all the artifact records in BioHub
   *
   * @memberof PlatformService
   */
  async submitProjectAttachmentsToBioHub(
    dataPackageId: string,
    projectId: number,
    attachmentIds: number[]
  ): Promise<{ project_attachment_publish_id: number }[]> {
    const attachments = await this.attachmentService.getProjectAttachmentsByIds(projectId, attachmentIds);

    const attachmentArtifactPublishRecords = await Promise.all(
      attachments.map(async (attachment) => {
        // Build artifact object
        const artifact = await this._makeArtifactFromAttachmentOrReport({
          dataPackageId,
          attachment,
          file_type: attachment.file_type || 'Other'
        });

        // Submit artifact to BioHub
        const { artifact_id } = await this._submitArtifactToBioHub(artifact);

        // Insert publish history record
        return this.historyPublishService.insertProjectAttachmentPublishRecord({
          artifact_id,
          project_attachment_id: attachment.project_attachment_id
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
   * @return {*}  {Promise<{ project_report_publish_id: number }[]>} The IDs of all the artifact records in BioHub
   *
   * @memberof PlatformService
   */
  async submitProjectReportAttachmentsToBioHub(
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
        // Build artifact object
        const artifact = await this._makeArtifactFromAttachmentOrReport({
          dataPackageId,
          attachment,
          file_type: 'Report'
        });

        // Submit artifact to BioHub
        const { artifact_id } = await this._submitArtifactToBioHub(artifact);

        // Insert publish history record
        return this.historyPublishService.insertProjectReportPublishRecord({
          artifact_id,
          project_report_attachment_id: attachment.project_report_attachment_id
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
   * @return {*}  {Promise<{ survey_attachment_publish_id: number }[]>} The IDs of all the artifact records in BioHub
   *
   * @memberof PlatformService
   */
  async submitSurveyAttachmentsToBioHub(
    dataPackageId: string,
    surveyId: number,
    attachmentIds: number[]
  ): Promise<{ survey_attachment_publish_id: number }[]> {
    const attachments = await this.attachmentService.getSurveyAttachmentsByIds(surveyId, attachmentIds);

    const attachmentArtifactPublishRecords = await Promise.all(
      attachments.map(async (attachment) => {
        // Build artifact object
        const artifact = await this._makeArtifactFromAttachmentOrReport({
          dataPackageId,
          attachment,
          file_type: attachment.file_type || 'Other'
        });

        // Submit artifact to BioHub
        const { artifact_id } = await this._submitArtifactToBioHub(artifact);

        // Insert publish history record
        return this.historyPublishService.insertSurveyAttachmentPublishRecord({
          artifact_id,
          survey_attachment_id: attachment.survey_attachment_id
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
   * @return {*}  {Promise<{ survey_report_publish_id: number }[]>} The IDs of all the artifact records in BioHub
   *
   * @memberof PlatformService
   */
  async submitSurveyReportAttachmentsToBioHub(
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
        // Build artifact object
        const artifact = await this._makeArtifactFromAttachmentOrReport({
          dataPackageId,
          attachment,
          file_type: 'Report'
        });

        // Submit artifact to BioHub
        const { artifact_id } = await this._submitArtifactToBioHub(artifact);

        // Insert publish history record
        return this.historyPublishService.insertSurveyReportPublishRecord({
          artifact_id,
          survey_report_attachment_id: attachment.survey_report_attachment_id
        });
      })
    );

    return reportArtifactPublishRecords;
  }

  /**
   * Makes artifact objects from the given attachment records.
   *
   * @param {({
   *     dataPackageId: string;
   *     attachment: IProjectAttachment | ISurveyAttachment | IProjectReportAttachment | ISurveyReportAttachment;
   *     file_type: string;
   *   })} data
   * @return {*}  {Promise<IArtifact>}
   *
   * @memberof PlatformService
   */
  async _makeArtifactFromAttachmentOrReport(data: {
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
   * Uploads the given survey occurrence input file to BioHub
   *
   * @param {number} surveyId
   * @param {string} dataPackageId
   * @memberof PlatformService
   */
  async submitSurveyObservationInputDataToBiohub(surveyId: number, dataPackageId: string) {
    const surveyService = new SurveyService(this.connection);
    const occurrenceSubmissionData = await surveyService.getLatestSurveyOccurrenceSubmission(surveyId);

    if (!occurrenceSubmissionData?.input_key) {
      throw new ApiGeneralError('Failed to submit survey to BioHub', ['Occurrence record has invalid s3 output key']);
    }

    // Build artifact object
    const observationArtifact = await this._makeArtifactFromObservationInputData(
      dataPackageId,
      occurrenceSubmissionData
    );

    //Submit artifact to BioHub
    const { artifact_id } = await this._submitArtifactToBioHub(observationArtifact);

    //Insert publish history record
    // TODO: this table isn't meant to track the input template (we don't have a spot for tracking it currently, if needed)
    await this.historyPublishService.insertOccurrenceSubmissionPublishRecord({
      occurrence_submission_id: occurrenceSubmissionData.occurrence_submission_id,
      queue_id: artifact_id
    });
  }

  /**
   *  Makes artifact objects from the given survey occurrence submission input data.
   *
   * @param {string} dataPackageId
   * @param {IGetLatestSurveyOccurrenceSubmission} observationSubmissionData
   * @return {*}  {Promise<IArtifact>}
   * @memberof PlatformService
   */
  async _makeArtifactFromObservationInputData(
    dataPackageId: string,
    observationSubmissionData: IGetLatestSurveyOccurrenceSubmission
  ): Promise<IArtifact> {
    const s3File = await getFileFromS3(observationSubmissionData.input_key);

    const artifactZip = new AdmZip();
    artifactZip.addFile(observationSubmissionData.input_file_name, s3File.Body as Buffer);

    const artifact: IArtifact = {
      dataPackageId,
      archiveFile: {
        data: artifactZip.toBuffer(),
        fileName: `${uuidv4()}.zip`,
        mimeType: 'application/zip'
      },
      metadata: {
        file_name: observationSubmissionData.input_file_name,
        file_size: String(s3File.ContentLength),
        file_type: 'Observations',
        title: observationSubmissionData.input_file_name,
        description: observationSubmissionData.message
      }
    };

    return artifact;
  }

  /**
   * Uploads the given survey summary submission to BioHub.
   *
   * @param {string} dataPackageId The dataPackageId for the artifact submission
   * @param {number} surveyId The ID of the survey
   * @return {*}  {Promise<{ survey_summary_submission_publish_id: number } | undefined>} The IDs of all the artifact records in
   * BioHub
   *
   * @memberof PlatformService
   */
  async submitSurveySummarySubmissionToBioHub(
    dataPackageId: string,
    surveyId: number
  ): Promise<{ survey_summary_submission_publish_id: number } | undefined> {
    const summaryService = new SummaryService(this.connection);

    const surveySummarySubmissionData = await summaryService.getLatestSurveySummarySubmission(surveyId);

    if (surveySummarySubmissionData) {
      // Build artifact object
      const summaryArtifact = await this._makeArtifactFromSurveySummarySubmission(
        dataPackageId,
        surveySummarySubmissionData
      );

      // Submit artifact to BioHub
      const { artifact_id } = await this._submitArtifactToBioHub(summaryArtifact);

      // Insert publish history record
      const summarySubmissionPublishRecord = await this.historyPublishService.insertSurveySummaryPublishRecord({
        survey_summary_submission_id: surveySummarySubmissionData.survey_summary_submission_id,
        artifact_id: artifact_id
      });

      return summarySubmissionPublishRecord;
    }
  }

  /**
   * Makes artifact objects from the given survey summary submission data.
   *
   * @param {string} dataPackageId
   * @param {ISurveySummaryDetails} surveySummarySubmissionData
   * @return {*}  {Promise<IArtifact>}
   * @memberof PlatformService
   */
  async _makeArtifactFromSurveySummarySubmission(
    dataPackageId: string,
    surveySummarySubmissionData: ISurveySummaryDetails
  ): Promise<IArtifact> {
    const s3File = await getFileFromS3(surveySummarySubmissionData.key);

    const artifactZip = new AdmZip();
    artifactZip.addFile(surveySummarySubmissionData.file_name, s3File.Body as Buffer);

    const artifact: IArtifact = {
      dataPackageId,
      archiveFile: {
        data: artifactZip.toBuffer(),
        fileName: `${surveySummarySubmissionData.uuid}.zip`,
        mimeType: 'application/zip'
      },
      metadata: {
        file_name: surveySummarySubmissionData.file_name,
        file_size: String(s3File.ContentLength),
        file_type: 'Summary Results',
        title: surveySummarySubmissionData.file_name,
        description: surveySummarySubmissionData.message
      }
    };

    return artifact;
  }

  /**
   * Makes a request to the BioHub API to submit an artifact.
   *
   * @param {IArtifact} artifact The artifact to submit to BioHub
   * @return {*}  {Promise<{ artifact_id: number }>} The ID belonging to the artifact record in BioHub
   *
   * @memberof PlatformService
   */
  async _submitArtifactToBioHub(artifact: IArtifact): Promise<{ artifact_id: number }> {
    defaultLog.debug({ label: '_submitArtifactToBioHub', metadata: artifact.metadata });

    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakServiceToken();

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

    const backboneArtifactIntakeUrl = new URL(getBackboneArtifactIntakePath(), getBackboneApiHost()).href;

    const { data } = await axios.post<{ artifact_id: number }>(backboneArtifactIntakeUrl, formData.getBuffer(), {
      headers: {
        authorization: `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    return data;
  }

  /**
   * Deletes the given attachment from BioHub.
   *
   * @param {string} artifactUUID
   * @return {*}  {Promise<void>}
   * @memberof PlatformService
   */
  async deleteAttachmentFromBiohub(artifactUUID: string): Promise<void> {
    defaultLog.debug({ label: 'deleteAttachmentFromBiohub', message: 'params', artifactUUID });

    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakServiceToken();

    const backboneArtifactIntakeUrl = new URL(getBackboneArtifactDeletePath(), getBackboneApiHost()).href;

    const response = await axios.post<boolean>(
      backboneArtifactIntakeUrl,
      {
        artifactUUIDs: [artifactUUID]
      },
      {
        headers: {
          authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.data) {
      throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to delete attachment from Biohub');
    }
  }
}
