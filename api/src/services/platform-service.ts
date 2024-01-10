import AdmZip from 'adm-zip';
import axios from 'axios';
import FormData from 'form-data';
import { Feature, FeatureCollection } from 'geojson';
import { URL } from 'url';
import { IDBConnection } from '../database/db';
import { ApiError, ApiErrorType, ApiGeneralError } from '../errors/api-error';
import { PostSurveySubmissionToBioHubObject } from '../models/biohub-create';
import { ISurveyAttachment } from '../repositories/attachment-repository';
import { ISurveyProprietorModel } from '../repositories/survey-repository';
import { getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { AttachmentService } from './attachment-service';
import { DBService } from './db-service';
import { HistoryPublishService } from './history-publish-service';
import { KeycloakService } from './keycloak-service';
import { ObservationService } from './observation-service';
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

export interface IFeatureArtifact {
  /**
   * An artifact zip file.
   */
  archiveFile: IArchiveFile;
  /**
   * UUID that uniquely identifies the submission feature artifact is contained in
   */
  submission_uuid: string;

  artifact_upload_key?: number;

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
// const getBackboneDwcIntakePath = () => process.env.BACKBONE_INTAKE_PATH || '/api/dwc/submission/queue';
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
   * Submit survey to BioHub.
   *
   * @param {number} surveyId
   * @param {{ additionalInformation: string }} data
   * @return {*}  {Promise<{ submission_uuid: number }>}
   * @memberof PlatformService
   */
  async submitSurveyToBioHub(
    surveyId: number,
    data: { additionalInformation: string }
  ): Promise<{ submission_uuid: number }> {
    defaultLog.debug({ label: 'submitSurveyToBioHub', message: 'params', surveyId });

    if (!getBackboneIntakeEnabled()) {
      throw new ApiGeneralError('BioHub intake is not enabled');
    }

    const keycloakService = new KeycloakService();

    // Get keycloak token for BioHub service account
    const token = await keycloakService.getKeycloakServiceToken();

    // Create intake url
    const backboneSurveyIntakeUrl = new URL(getBackboneSurveyIntakePath(), getBackboneApiHost()).href;

    // Get survey attachments
    const surveyAttachments = await this.attachmentService.getSurveyAttachments(surveyId);

    // Generate survey data package
    const surveyDataPackage = await this.generateSurveyDataPackage(
      surveyId,
      surveyAttachments,
      data.additionalInformation
    );

    console.log('surveyDataPackage', surveyDataPackage);

    // Submit survey data package to BioHub
    const response = await axios.post<{
      submission_uuid: number;
      artifact_ids: { artifact_filename: string; artifact_upload_key: number }[];
    }>(backboneSurveyIntakeUrl, surveyDataPackage, {
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    // Check for response data
    if (!response.data) {
      throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to submit survey ID to Biohub');
    }

    // Submit survey attachments to BioHub
    const submitSurveyAttachment = await this._submitSurveyAttachmentsToBioHub(
      surveyDataPackage.id,
      surveyAttachments,
      response.data.artifact_ids
    );

    console.log('submitSurveyAttachment', submitSurveyAttachment);

    // Insert publish history record

    // NOTE: this is a temporary solution to get the queue_id into the publish history table
    //      the queue_id is not returned from the survey intake endpoint, so we are using the submission_uuid
    //      as a temporary solution
    await this.historyPublishService.insertSurveyMetadataPublishRecord({
      survey_id: surveyId,
      queue_id: response.data.submission_uuid
    });

    return { submission_uuid: response.data.submission_uuid };
  }

  /**
   * Generate survey data package to submit to BioHub.
   *
   * @param {number} surveyId
   * @param {ISurveyAttachment[]} surveyAttachments
   * @param {string} additionalInformation
   * @return {*}  {Promise<PostSurveySubmissionToBioHubObject>}
   * @memberof PlatformService
   */
  async generateSurveyDataPackage(
    surveyId: number,
    surveyAttachments: ISurveyAttachment[],
    additionalInformation: string
  ): Promise<PostSurveySubmissionToBioHubObject> {
    const observationService = new ObservationService(this.connection);
    const surveyService = new SurveyService(this.connection);

    // Get survey data
    const survey = await surveyService.getSurveyData(surveyId);
    const { surveyObservations } = await observationService.getSurveyObservationsWithSupplementaryData(surveyId);
    const surveyLocation = await surveyService.getSurveyLocationsData(surveyId);

    const geometryFeatureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: surveyLocation.flatMap((location) => location.geojson as Feature[])
    };

    // Generate survey data package
    const surveyDataPackage = new PostSurveySubmissionToBioHubObject(
      survey,
      surveyObservations,
      geometryFeatureCollection,
      surveyAttachments,
      additionalInformation
    );

    return surveyDataPackage;
  }

  /**
   * Submit survey attachments submission to BioHub.
   *
   * @param {string} submissionUUID
   * @param {ISurveyAttachment[]} surveyAttachments
   * @return {*}  {Promise<{ survey_attachment_publish_id: number }[]>}
   * @memberof PlatformService
   */
  async _submitSurveyAttachmentsToBioHub(
    submissionUUID: string,
    surveyAttachments: ISurveyAttachment[],
    artifact_ids: { artifact_filename: string; artifact_upload_key: number }[]
  ): Promise<{ survey_attachment_publish_id: number }[]> {
    // Submit survey attachments to BioHub
    const attachmentArtifactPublishRecords = await Promise.all(
      // Loop through survey attachments
      surveyAttachments.map(async (attachment) => {
        // Get artifact_upload_key for attachment
        const artifactUploadKey = artifact_ids.find((artifact) => artifact.artifact_filename === attachment.file_name)
          ?.artifact_upload_key;
        console.log('artifactUploadKey', artifactUploadKey);

        // Throw error if artifact_upload_key is not found
        if (!artifactUploadKey) {
          throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to submit survey attachment to Biohub');
        }

        // Build artifact object
        const artifact = await this._makeArtifactFromSurveyAttachment(submissionUUID, artifactUploadKey, attachment);
        console.log('artifact', artifact);

        // Submit artifact to BioHub
        const { artifact_id } = await this._submitArtifactFeatureToBioHub(artifact);
        console.log('artifact_id', artifact_id);

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
   * Create artifact object from survey attachment.
   *
   * @param {{
   *     submissionUUID: string;
   *     attachment: ISurveyAttachment;
   *   }} data
   * @return {*}  {Promise<IFeatureArtifact>}
   * @memberof PlatformService
   */
  async _makeArtifactFromSurveyAttachment(
    submissionUUID: string,
    artifactUploadKey: number,
    attachment: ISurveyAttachment
  ): Promise<IFeatureArtifact> {
    // Get attachment file from S3
    const s3File = await getFileFromS3(attachment.key);
    const artifactZip = new AdmZip();
    // Add attachment file to artifact zip
    artifactZip.addFile(attachment.file_name, s3File.Body as Buffer);

    // Build artifact object
    return {
      submission_uuid: submissionUUID,
      artifact_upload_key: artifactUploadKey,
      archiveFile: {
        data: artifactZip.toBuffer(),
        fileName: `${attachment.uuid}.zip`,
        mimeType: 'application/zip'
      },
      metadata: {
        file_name: attachment.file_name,
        file_size: attachment.file_size,
        file_type: attachment.file_type,
        title: attachment.title,
        description: attachment.description
      }
    };
  }

  /**
   * Submit survey Artifact Feature to BioHub.
   *
   * @param {IFeatureArtifact} artifact
   * @return {*}  {Promise<{ artifact_id: number }>}
   * @memberof PlatformService
   */
  async _submitArtifactFeatureToBioHub(artifact: IFeatureArtifact): Promise<{ artifact_id: number }> {
    defaultLog.debug({ label: '_submitArtifactToBioHub', metadata: artifact.metadata });

    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakServiceToken();

    const formData = new FormData();

    formData.append('media', artifact.archiveFile.data, {
      filename: artifact.archiveFile.fileName,
      contentType: artifact.archiveFile.mimeType
    });

    formData.append('submission_uuid', artifact.submission_uuid);
    formData.append('artifact_upload_key', String(artifact.artifact_upload_key));

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
