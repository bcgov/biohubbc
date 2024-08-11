import axios from 'axios';
import FormData from 'form-data';
import { Feature, FeatureCollection } from 'geojson';
import mime from 'mime';
import qs from 'qs';
import { URL } from 'url';
import { IDBConnection } from '../database/db';
import { ApiError, ApiErrorType, ApiGeneralError } from '../errors/api-error';
import { PostSurveySubmissionToBioHubObject } from '../models/biohub-create';
import { ISurveyAttachment, ISurveyReportAttachment } from '../repositories/attachment-repository';
import { isFeatureFlagPresent } from '../utils/feature-flag-utils';
import { getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { AttachmentService } from './attachment-service';
import { DBService } from './db-service';
import { HistoryPublishService } from './history-publish-service';
import { KeycloakService } from './keycloak-service';
import { ObservationService } from './observation-service';
import { SurveyService } from './survey-service';

const defaultLog = getLogger('services/platform-service');

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

export interface IItisSearchResult {
  tsn: string;
  commonNames?: string[];
  scientificName: string;
}

export interface ITaxonomy {
  tsn: number;
  commonNames?: string[];
  scientificName: string;
  rank: string;
  kingdom: string;
}

export interface IPostCollectionUnit {
  critterbase_collection_unit_id: string;
  critterbase_collection_category_id: string;
}

export interface ITaxonomyWithEcologicalUnits extends ITaxonomy {
  ecological_units: IPostCollectionUnit[];
}

const getBackboneInternalApiHost = () => process.env.BACKBONE_INTERNAL_API_HOST || '';
const getBackboneArtifactIntakePath = () => process.env.BACKBONE_ARTIFACT_INTAKE_PATH || '';
const getBackboneSurveyIntakePath = () => process.env.BACKBONE_INTAKE_PATH || '';
const getBackboneTaxonTsnPath = () => process.env.BIOHUB_TAXON_TSN_PATH || '';

export class PlatformService extends DBService {
  attachmentService: AttachmentService;
  historyPublishService: HistoryPublishService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.historyPublishService = new HistoryPublishService(this.connection);
    this.attachmentService = new AttachmentService(connection);
  }

  /**
   * Get taxonomic data from BioHub.
   *
   * @param {(string | number)[]} tsns
   * @return {*}  {Promise<IItisSearchResult[]>}
   * @memberof PlatformService
   */
  async getTaxonomyByTsns(tsns: (string | number)[]): Promise<IItisSearchResult[]> {
    defaultLog.debug({ label: 'getTaxonomyByTsns', tsns });

    if (!tsns.length) {
      return [];
    }

    try {
      const keycloakService = new KeycloakService();

      const token = await keycloakService.getKeycloakServiceToken();

      const backboneTaxonTsnUrl = new URL(getBackboneTaxonTsnPath(), getBackboneInternalApiHost()).href;

      const { data } = await axios.get<{ searchResponse: IItisSearchResult[] }>(backboneTaxonTsnUrl, {
        headers: {
          authorization: `Bearer ${token}`
        },
        params: {
          tsn: [...new Set(tsns)]
        },
        paramsSerializer: (params) => {
          return qs.stringify(params);
        }
      });

      return data.searchResponse;
    } catch (error) {
      return [];
    }
  }

  /**
   * Submit survey to BioHub.
   *
   * @param {number} surveyId
   * @param {{ submissionComment: string }} data
   * @return {*}  {Promise<{ submission_uuid: string }>}
   * @memberof PlatformService
   */
  async submitSurveyToBioHub(
    surveyId: number,
    data: { submissionComment: string }
  ): Promise<{ submission_uuid: string }> {
    defaultLog.debug({ label: 'submitSurveyToBioHub', message: 'params', surveyId });

    if (isFeatureFlagPresent(['API_FF_SUBMIT_BIOHUB'])) {
      throw new ApiGeneralError('Publishing to BioHub is not currently enabled.');
    }

    const keycloakService = new KeycloakService();

    // Get keycloak token for SIMS service client account
    const token = await keycloakService.getKeycloakServiceToken();

    // Create intake url
    const backboneSurveyIntakeUrl = new URL(getBackboneSurveyIntakePath(), getBackboneInternalApiHost()).href;

    // Get survey attachments
    const surveyAttachments = await this.attachmentService.getSurveyAttachmentsForBioHubSubmission(surveyId);

    // Get survey report attachments
    const surveyReportAttachments = await this.attachmentService.getSurveyReportAttachments(surveyId);

    // Generate survey data package
    const surveyDataPackage = await this._generateSurveyDataPackage(
      surveyId,
      surveyAttachments,
      surveyReportAttachments,
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

    await Promise.all([
      // Submit survey attachments to BioHub
      this._submitSurveyAttachmentsToBioHub(
        surveyDataPackage.id,
        surveyAttachments,
        response.data.artifact_upload_keys
      ),
      // Submit survey report attachments to BioHub
      this._submitSurveyReportAttachmentsToBioHub(
        surveyDataPackage.id,
        surveyReportAttachments,
        response.data.artifact_upload_keys
      )
    ]);

    // Insert publish history record
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
   * @param {ISurveyReportAttachment[]} surveyReportAttachments
   * @param {string} submissionComment
   * @return {*}  {Promise<PostSurveySubmissionToBioHubObject>}
   * @memberof PlatformService
   */
  async _generateSurveyDataPackage(
    surveyId: number,
    surveyAttachments: ISurveyAttachment[],
    surveyReportAttachments: ISurveyReportAttachment[],
    submissionComment: string
  ): Promise<PostSurveySubmissionToBioHubObject> {
    const observationService = new ObservationService(this.connection);
    const surveyService = new SurveyService(this.connection);

    // Get survey data
    const survey = await surveyService.getSurveyData(surveyId);

    const surveyObservations = await observationService.getAllSurveyObservations(surveyId);
    const purposeAndMethodology = await surveyService.getSurveyPurposeAndMethodology(surveyId);
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
      surveyReportAttachments,
      submissionComment
    );

    return surveyDataPackage;
  }

  /**
   * Submit survey attachments submission to BioHub.
   *
   * @param {string} submissionUUID
   * @param {ISurveyReportAttachment[]} surveyReportAttachments
   * @param {{ artifact_filename: string; artifact_upload_key: number }[]} artifact_upload_keys
   * @return {*}  {Promise<{ survey_report_publish_id: number }[]>}
   * @memberof PlatformService
   */
  async _submitSurveyAttachmentsToBioHub(
    submissionUUID: string,
    surveyAttachments: ISurveyAttachment[],
    artifact_upload_keys: { artifact_filename: string; artifact_upload_key: number }[]
  ): Promise<{ survey_attachment_publish_id: number }[]> {
    // Submit survey attachments to BioHub
    return Promise.all(
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
          // TODO: Cast to unknown required due to issue in aws-sdk v3 typings
          // See https://stackoverflow.com/questions/76142043/getting-a-readable-from-getobject-in-aws-s3-sdk-v3
          // See https://github.com/aws/aws-sdk-js-v3/issues/4720
          data: s3File.Body as unknown as Buffer,
          fileName: attachment.file_name,
          mimeType: s3File.ContentType || mime.getType(attachment.file_name) || 'application/octet-stream'
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
  }

  /**
   * Submit survey report attachments submission to BioHub.
   *
   * @param {string} submissionUUID
   * @param {ISurveyReportAttachment[]} surveyReportAttachments
   * @param {{ artifact_filename: string; artifact_upload_key: number }[]} artifact_upload_keys
   * @return {*}  {Promise<{ survey_report_publish_id: number }[]>}
   * @memberof PlatformService
   */
  async _submitSurveyReportAttachmentsToBioHub(
    submissionUUID: string,
    surveyReportAttachments: ISurveyReportAttachment[],
    artifact_upload_keys: { artifact_filename: string; artifact_upload_key: number }[]
  ): Promise<{ survey_report_publish_id: number }[]> {
    // Submit survey attachments to BioHub
    return Promise.all(
      // Loop through survey report attachments
      surveyReportAttachments.map(async (attachment) => {
        // Get artifact_upload_key for attachment
        const artifactUploadKey = artifact_upload_keys.find(
          (artifact) => artifact.artifact_filename === attachment.file_name
        )?.artifact_upload_key;

        // Throw error if artifact_upload_key is not found
        if (!artifactUploadKey) {
          throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to submit survey report attachment to Biohub');
        }

        const s3File = await getFileFromS3(attachment.key);

        // Build artifact object
        const artifact = {
          submission_uuid: submissionUUID,
          artifact_upload_key: artifactUploadKey,
          // TODO: Cast to unknown required due to issue in aws-sdk v3 typings
          // See https://stackoverflow.com/questions/76142043/getting-a-readable-from-getobject-in-aws-s3-sdk-v3
          // See https://github.com/aws/aws-sdk-js-v3/issues/4720
          data: s3File.Body as unknown as Buffer,
          fileName: attachment.file_name,
          mimeType: s3File.ContentType || mime.getType(attachment.file_name) || 'application/octet-stream'
        };

        // Submit artifact to BioHub
        const { artifact_uuid } = await this._submitArtifactFeatureToBioHub(artifact);

        // Insert publish history record
        return this.historyPublishService.insertSurveyReportPublishRecord({
          artifact_uuid,
          survey_report_attachment_id: attachment.survey_report_attachment_id
        });
      })
    );
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

    const backboneArtifactIntakeUrl = new URL(getBackboneArtifactIntakePath(), getBackboneInternalApiHost()).href;

    const { data } = await axios.post<{ artifact_uuid: string }>(backboneArtifactIntakeUrl, formData.getBuffer(), {
      headers: {
        authorization: `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    return data;
  }
}
