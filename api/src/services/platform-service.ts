import axios from 'axios';
import FormData from 'form-data';
import { Feature, FeatureCollection } from 'geojson';
import mime from 'mime';
import { URL } from 'url';
import { IDBConnection } from '../database/db';
import { ApiError, ApiErrorType, ApiGeneralError } from '../errors/api-error';
import { PostSurveySubmissionToBioHubObject } from '../models/biohub-create';
import { ISurveyAttachment } from '../repositories/attachment-repository';
import { getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { AttachmentService } from './attachment-service';
import { DBService } from './db-service';
import { HistoryPublishService } from './history-publish-service';
import { KeycloakService } from './keycloak-service';
import { ObservationService } from './observation-service';
import { SurveyService } from './survey-service';

const defaultLog = getLogger('services/platform-repository');

export interface IArtifact {
  /**
   * UUID that uniquely identifies the submission feature artifact is contained in
   */
  submission_uuid: string;
  /**
   * The BioHub artifact upload key, used to associate the submitted artifact with the appropriate submission.
   */
  artifact_upload_key?: number;
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

const getBackboneIntakeEnabled = () => process.env.BACKBONE_INTAKE_ENABLED === 'true' || false;
const getBackboneApiHost = () => process.env.BACKBONE_API_HOST || '';
const getBackboneArtifactIntakePath = () => process.env.BACKBONE_ARTIFACT_INTAKE_PATH || '/api/artifact/intake';
const getBackboneSurveyIntakePath = () => process.env.BACKBONE_DATASET_INTAKE_PATH || '/api/submission/intake';

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
   * @param {{ submissionComment: string }} data
   * @return {*}  {Promise<{ submission_uuid: number }>}
   * @memberof PlatformService
   */
  async submitSurveyToBioHub(
    surveyId: number,
    data: { submissionComment: string }
  ): Promise<{ submission_uuid: string }> {
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
    const surveyDataPackage = await this._generateSurveyDataPackage(
      surveyId,
      surveyAttachments,
      data.submissionComment
    );

    // Submit survey data package to BioHub
    const response = await axios.post<{
      submission_uuid: string;
      artifact_upload_keys: { artifact_filename: string; artifact_upload_key: number }[];
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
    await this._submitSurveyAttachmentsToBioHub(
      surveyDataPackage.id,
      surveyAttachments,
      response.data.artifact_upload_keys
    );

    // Insert publish history record

    // NOTE: this is a temporary solution to get the submission_uuid into the publish history table
    //      the submission_uuid is not returned from the survey intake endpoint, so we are using the submission_uuid
    //      as a temporary solution
    await this.historyPublishService.insertSurveyMetadataPublishRecord({
      survey_id: surveyId,
      submission_uuid: response.data.submission_uuid
    });

    return { submission_uuid: response.data.submission_uuid };
  }

  /**
   * Generate survey data package to submit to BioHub.
   *
   * @param {number} surveyId
   * @param {ISurveyAttachment[]} surveyAttachments
   * @param {string} submissionComment
   * @return {*}  {Promise<PostSurveySubmissionToBioHubObject>}
   * @memberof PlatformService
   */
  async _generateSurveyDataPackage(
    surveyId: number,
    surveyAttachments: ISurveyAttachment[],
    submissionComment: string
  ): Promise<PostSurveySubmissionToBioHubObject> {
    const observationService = new ObservationService(this.connection);
    const surveyService = new SurveyService(this.connection);

    // Get survey data
    const survey = await surveyService.getSurveyData(surveyId);
    const purposeAndMethodology = await surveyService.getSurveyPurposeAndMethodology(surveyId);
    const { surveyObservations } = await observationService.getSurveyObservationsWithSupplementaryData(surveyId);
    const surveyLocation = await surveyService.getSurveyLocationsData(surveyId);

    const geometryFeatureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: surveyLocation.flatMap((location) => location.geojson as Feature[])
    };

    // Generate survey data package
    const surveyDataPackage = new PostSurveySubmissionToBioHubObject(
      survey,
      purposeAndMethodology,
      surveyObservations,
      geometryFeatureCollection,
      surveyAttachments,
      submissionComment
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
    artifact_upload_keys: { artifact_filename: string; artifact_upload_key: number }[]
  ): Promise<void> {
    // Submit survey attachments to BioHub
    await Promise.all(
      // Loop through survey attachments
      surveyAttachments.map(async (attachment) => {
        // Get artifact_upload_key for attachment
        const artifactUploadKey = artifact_upload_keys.find(
          (artifact) => artifact.artifact_filename === attachment.file_name
        )?.artifact_upload_key;

        // Throw error if artifact_upload_key is not found
        if (!artifactUploadKey) {
          throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to submit survey attachment to Biohub');
        }

        const s3File = await getFileFromS3(attachment.key);

        // Build artifact object
        const artifact = {
          submission_uuid: submissionUUID,
          artifact_upload_key: artifactUploadKey,
          data: s3File.Body as Buffer,
          fileName: attachment.file_name,
          mimeType: s3File.ContentType || mime.getType(attachment.file_name) || attachment.file_type

          //   metadata: {
          //     file_name: attachment.file_name,
          //     file_size: attachment.file_size,
          //     file_type: attachment.file_type,
          //     title: attachment.title,
          //     description: attachment.description
          //   }
        };

        // Submit artifact to BioHub
        const { artifact_uuid } = await this._submitArtifactFeatureToBioHub(artifact);

        // Insert publish history record
        return this.historyPublishService.insertSurveyAttachmentPublishRecord({
          artifact_uuid,
          survey_attachment_id: attachment.survey_attachment_id
        });
      })
    );

    // return attachmentArtifactPublishRecords;
  }

  /**
   * Submit survey Artifact to BioHub.
   *
   * @param {IArtifact} artifact
   * @return {*}  {Promise<{ artifact_uuid: string }>}
   * @memberof PlatformService
   */
  async _submitArtifactFeatureToBioHub(artifact: IArtifact): Promise<{ artifact_uuid: string }> {
    defaultLog.debug({ label: '_submitArtifactToBioHub', metadata: artifact.fileName });

    const keycloakService = new KeycloakService();

    const token = await keycloakService.getKeycloakServiceToken();

    const formData = new FormData();

    formData.append('media', artifact.data, {
      filename: artifact.fileName,
      contentType: artifact.mimeType
    });
    formData.append('submission_uuid', artifact.submission_uuid);
    formData.append('artifact_upload_key', String(artifact.artifact_upload_key));

    const backboneArtifactIntakeUrl = new URL(getBackboneArtifactIntakePath(), getBackboneApiHost()).href;

    const { data } = await axios.post<{ artifact_uuid: string }>(backboneArtifactIntakeUrl, formData.getBuffer(), {
      headers: {
        authorization: `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    return data;
  }
}
