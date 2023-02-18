import AdmZip from 'adm-zip';
import axios from 'axios';
import FormData from 'form-data';
import { URL } from 'url';
import { IDBConnection } from '../database/db';
import { HTTP400 } from '../errors/http-error';
import {
  IAttachment,
  IProjectAttachment,
  IProjectReportAttachment,
  ISurveyAttachment,
  ISurveyReportAttachment
} from '../repositories/attachment-repository';
import { getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { AttachmentService } from './attachment-service';
import { DBService } from './db-service';
import { EmlService } from './eml-service';
import { KeycloakService } from './keycloak-service';
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
export class PlatformService extends DBService {
  attachmentService: AttachmentService;
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

    this.attachmentService = new AttachmentService(connection);
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
   * @return {*}
   * @memberof PlatformService
   */
  async submitDwCAMetadataPackage(projectId: number) {
    try {
      if (!this.backboneIntakeEnabled) {
        return;
      }

      const emlService = new EmlService({ projectId: projectId }, this.connection);

      const emlString = await emlService.buildProjectEml();

      const dwcArchiveZip = new AdmZip();
      dwcArchiveZip.addFile('eml.xml', Buffer.from(emlString));

      const dwCADataset = {
        archiveFile: {
          data: dwcArchiveZip.toBuffer(),
          fileName: 'DwCA.zip',
          mimeType: 'application/zip'
        },
        dataPackageId: emlService.packageId
      };

      return this._submitDwCADatasetToBioHubBackbone(dwCADataset);
    } catch (error) {
      const defaultLog = getLogger('platformService->submitDwCAMetadataPackage');
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
  async submitDwCADataPackage(projectId: number) {
    if (!this.backboneIntakeEnabled) {
      return;
    }

    const emlService = new EmlService({ projectId: projectId }, this.connection);

    const emlString = await emlService.buildProjectEml();

    const dwcArchiveZip = new AdmZip();
    dwcArchiveZip.addFile('eml.xml', Buffer.from(emlString));
    // TODO fetch and add DwCA data files to archive

    const dwCADataset = {
      archiveFile: {
        data: dwcArchiveZip.toBuffer(),
        fileName: 'DwCA.zip',
        mimeType: 'application/zip'
      },
      dataPackageId: emlService.packageId
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
  async _submitDwCADatasetToBioHubBackbone(dwcaDataset: IDwCADataset): Promise<{ data_package_id: string }> {
    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakToken();

    const formData = new FormData();

    formData.append('media', dwcaDataset.archiveFile.data, {
      filename: dwcaDataset.archiveFile.fileName,
      contentType: dwcaDataset.archiveFile.mimeType
    });

    formData.append('data_package_id', dwcaDataset.dataPackageId);

    const backboneIntakeUrl = new URL(this.backboneIntakePath, this.backboneApiHost).href;

    const { data } = await axios.post<{ data_package_id: string }>(backboneIntakeUrl, formData.getBuffer(), {
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
   * @return {*}
   * @memberof PlatformService
   */
  async uploadSurveyDataToBioHub(projectId: number, surveyId: number) {
    if (!this.backboneIntakeEnabled) {
      return;
    }

    const surveyService = new SurveyService(this.connection);
    const surveyData = await surveyService.getLatestSurveyOccurrenceSubmission(surveyId);

    if (!surveyData || !surveyData.output_key) {
      throw new HTTP400('no s3Key found');
    }

    const s3File = await getFileFromS3(surveyData.output_key);

    if (!s3File) {
      throw new HTTP400('no s3File found');
    }

    const dwcArchiveZip = new AdmZip(s3File.Body as Buffer);

    const emlService = new EmlService({ projectId: projectId }, this.connection);
    const emlString = await emlService.buildProjectEml();

    if (!emlString) {
      throw new HTTP400('emlString failed to build');
    }

    dwcArchiveZip.addFile('eml.xml', Buffer.from(emlString));

    const dwCADataset = {
      archiveFile: {
        data: dwcArchiveZip.toBuffer(),
        fileName: 'DwCA.zip',
        mimeType: 'application/zip'
      },
      dataPackageId: emlService.packageId
    };

    return this._submitDwCADatasetToBioHubBackbone(dwCADataset);
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
  _makeArtifactsFromAttachments(
    dataPackageId: string,
    attachments: (IProjectAttachment | ISurveyAttachment)[],
    reportAttachments: (IProjectReportAttachment | ISurveyReportAttachment)[]
  ): Promise<IArtifact[]> {
    const promises = [...attachments, ...reportAttachments].map(async (attachment: IAttachment, index: number) => {
      const isReportAttachment = (
        attachment: IAttachment
      ): attachment is IProjectReportAttachment | ISurveyReportAttachment => {
        return index >= attachments.length;
      };

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
          file_type: isReportAttachment(attachment) ? 'Report' : attachment.file_type || 'Other',
          title: attachment.title,
          description: attachment.description
        }
      };
    });

    return Promise.all(promises);
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
    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakToken();

    const formData = new FormData();

    formData.append('media', artifact.archiveFile.data, {
      filename: artifact.archiveFile.fileName,
      contentType: artifact.archiveFile.mimeType
    });

    formData.append('data_package_id', artifact.dataPackageId);

    Object.entries(artifact.metadata).forEach(([metadataKey, metadataValue]) => {
      formData.append(`metadata[${metadataKey}]`, metadataValue);
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
   * Uploads the given project attachments and report attachments to BioHub.
   *
   * @param {string} dataPackageId The dataPackageId for the artifact submission
   * @param {number} projectId The ID of the project
   * @param {number[]} attachmentIds The particular IDs of the attachments to submit to BioHub
   * @param {number[]} reportAttachmentIds The particular IDs of the report attachments to submit to BioHub
   * @returns {*} {Promise<{artifact_id: number}[]>} The IDs of all the artifact records in BioHub
   *
   * @memberof PlatformService
   */
  async uploadProjectAttachmentsToBioHub(
    dataPackageId: string,
    projectId: number,
    attachmentIds: number[],
    reportAttachmentIds: number[]
  ): Promise<{ artifact_id: number }[]> {
    const attachments = (
      await this.attachmentService.getProjectAttachments(projectId)
    ).filter((attachment: IProjectAttachment) => attachmentIds.includes(attachment.id));

    const reportAttachments = (
      await this.attachmentService.getProjectReportAttachments(projectId)
    ).filter((reportAttachment: IProjectReportAttachment) => reportAttachmentIds.includes(reportAttachment.id));

    const promises = (await this._makeArtifactsFromAttachments(dataPackageId, attachments, reportAttachments)).map(
      this._submitArtifactToBioHub
    );

    return Promise.all(promises);
  }

  /**
   * Uploads the given survey attachments and report attachments to BioHub.
   *
   * @param {string} dataPackageId The dataPackageId for the artifact submission
   * @param {number} surveyId The ID of the survey
   * @param {number[]} attachmentIds The particular IDs of the attachments to submit to BioHub
   * @param {number[]} reportAttachmentIds The particular IDs of the report attachments to submit to BioHub
   * @returns {*} {Promise<{artifact_id: number}[]>} The IDs of all the artifact records in BioHub
   *
   * @memberof PlatformService
   */
  async uploadSurveyAttachmentsToBioHub(
    dataPackageId: string,
    surveyId: number,
    attachmentIds: number[],
    reportAttachmentIds: number[]
  ): Promise<{ artifact_id: number }[]> {
    const attachments = (
      await this.attachmentService.getSurveyAttachments(surveyId)
    ).filter((attachment: ISurveyAttachment) => attachmentIds.includes(attachment.id));

    const reportAttachments = (
      await this.attachmentService.getSurveyReportAttachments(surveyId)
    ).filter((reportAttachment: ISurveyReportAttachment) => reportAttachmentIds.includes(reportAttachment.id));

    const promises = (await this._makeArtifactsFromAttachments(dataPackageId, attachments, reportAttachments)).map(
      this._submitArtifactToBioHub
    );

    return Promise.all(promises);
  }
}
