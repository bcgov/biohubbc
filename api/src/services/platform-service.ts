import axios from 'axios';
import { Feature, FeatureCollection } from 'geojson';
import fs from 'node:fs';
import path from 'node:path';
import qs from 'qs';
import * as tarStream from 'tar-stream';
import { URL } from 'url';
import { IDBConnection } from '../database/db';
import { ApiError, ApiErrorType, ApiGeneralError } from '../errors/api-error';
import { formatAxiosError } from '../errors/axios-error';
import {
  BiohubFeatureType,
  PostSurveySubmissionToBioHubObject,
  PUBLISHABLE_FEATURE_TYPE_PARENTS,
  PUBLISHABLE_FEATURE_TYPES
} from '../models/biohub-create';
import { ISurveyAttachment, ISurveyReportAttachment } from '../repositories/attachment-repository';
import { getEnvironmentVariable } from '../utils/env-config';
import { isFeatureFlagPresent } from '../utils/feature-flag-utils';
import { getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';
import { AttachmentService } from './attachment-service';
import { CodeService } from './code-service';
import { ICritterDetailed, IPostCollectionUnit } from './critterbase-service';
import { DBService } from './db-service';
import { SurveyHabitatFeatureService } from './habitat-feature-services/survey-habitat-feature-service';
import { HistoryPublishService } from './history-publish-service';
import { KeycloakService } from './keycloak-service';
import { ObservationService } from './observation-services/observation-service';
import {
  CreateExistingSubmissionUploadRequest,
  CreateSubmissionRequest,
  IBioHubSubmissionHistoryRow,
  IBioHubWrappedSubmissionHistoryResponse,
  ISubmissionHistoryRow,
  SubmissionSubmitter,
  SubmissionUploadInitiateResponse,
  UploadPart,
  UploadPartByteRange,
  UploadResult,
  UploadTarFilePartsOptions
} from './platform-service.interface';
import { SamplePeriodService } from './sample-period-service';
import { SampleSiteService } from './sample-site-service';
import { SampleTechniqueService } from './sample-technique-service';
import { SurveyCritterService } from './survey-critter-service';
import { SurveyService } from './survey-service';
import { TelemetryDeploymentService } from './telemetry-services/telemetry-deployment-service';
import { TelemetryDeviceService } from './telemetry-services/telemetry-device-service';
import { TelemetryVendorService } from './telemetry-services/telemetry-vendor-service';

const defaultLog = getLogger('services/platform-service');

export interface IItisSearchResult {
  tsn: number;
  commonNames?: string[];
  scientificName: string;
}

interface ITaxonomy {
  tsn: number;
  commonNames?: string[];
  scientificName: string;
  rank: string;
  kingdom: string;
}

export interface ITaxonomyWithEcologicalUnits extends ITaxonomy {
  ecological_units: IPostCollectionUnit[];
}

export type PublishSurveyData = {
  submissionComment: string;
  featureTypes?: BiohubFeatureType[];
};

interface IFlattenedBlock {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  content: string[];
  parent: string | null;
}

interface INestedBlock {
  id: string;
  type?: string;
  properties?: Record<string, unknown>;
  child_features?: INestedBlock[];
}

export enum TARBALL_FILE_ROLE {
  CODESET = 'codeset',
  FEATURE = 'feature'
}

const getBackboneInternalApiHost = () => getEnvironmentVariable('BACKBONE_INTERNAL_API_HOST');
const getBackboneTaxonTsnPath = () => getEnvironmentVariable('BIOHUB_TAXON_TSN_PATH');
const getBackboneTaxonPath = () => getEnvironmentVariable('BIOHUB_TAXON_PATH');
const getBackboneSubmissionUploadPath = () => getEnvironmentVariable('BACKBONE_SUBMISSION_UPLOAD_PATH');
const getBackboneUploadCompletePath = () => getEnvironmentVariable('BACKBONE_UPLOAD_COMPLETE_PATH');

export class PlatformService extends DBService {
  attachmentService: AttachmentService;
  historyPublishService: HistoryPublishService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.historyPublishService = new HistoryPublishService(this.connection);
    this.attachmentService = new AttachmentService(connection);
  }

  /**
   * Normalize selected feature types by expanding parent dependencies.
   *
   * @param {(BiohubFeatureType[] | undefined)} featureTypes
   * @return {Set<BiohubFeatureType>}
   * @memberof PlatformService
   */
  normalizePublishFeatureTypes(featureTypes?: BiohubFeatureType[]): Set<BiohubFeatureType> {
    const seedFeatureTypes = featureTypes?.length ? featureTypes : [...PUBLISHABLE_FEATURE_TYPES];
    const allowedFeatureTypes = new Set<BiohubFeatureType>(PUBLISHABLE_FEATURE_TYPES);
    const normalizedFeatureTypes = new Set<BiohubFeatureType>(
      seedFeatureTypes.filter((featureType): featureType is BiohubFeatureType => allowedFeatureTypes.has(featureType))
    );

    const addParents = (featureType: BiohubFeatureType) => {
      const parentFeatureTypes = PUBLISHABLE_FEATURE_TYPE_PARENTS[featureType] || [];

      parentFeatureTypes.forEach((parentFeatureType) => {
        if (!normalizedFeatureTypes.has(parentFeatureType)) {
          normalizedFeatureTypes.add(parentFeatureType);
          addParents(parentFeatureType);
        }
      });
    };

    [...normalizedFeatureTypes].forEach((featureType) => addParents(featureType));

    return normalizedFeatureTypes;
  }

  /**
   * Get publishable survey feature types that exist for the survey.
   *
   * If a child feature exists, its parent feature type is automatically included.
   *
   * @param {number} surveyId
   * @return {Promise<{ featureTypes: BiohubFeatureType[] }>}
   * @memberof PlatformService
   */
  async getSurveyPublishableFeatures(surveyId: number): Promise<{ featureTypes: BiohubFeatureType[] }> {
    const observationService = new ObservationService(this.connection);
    const sampleSiteService = new SampleSiteService(this.connection);
    const samplePeriodService = new SamplePeriodService(this.connection);
    const sampleTechniqueService = new SampleTechniqueService(this.connection);
    const surveyService = new SurveyService(this.connection);
    const surveyCritterService = new SurveyCritterService(this.connection);
    const habitatFeatureService = new SurveyHabitatFeatureService(this.connection);
    const telemetryDeviceService = new TelemetryDeviceService(this.connection);
    const telemetryDeploymentService = new TelemetryDeploymentService(this.connection);
    const telemetryVendorService = new TelemetryVendorService(this.connection);

    const [
      sampleSiteCount,
      samplePeriodCount,
      sampleTechniqueCount,
      observationCount,
      habitatFeatureCount,
      telemetryDeviceCount,
      telemetryDeploymentCount,
      surveyAttachmentCount,
      surveyLocations,
      surveyReportAttachments,
      surveyAnimals,
      sampleSitesForBlocks,
      siteSelectionData
    ] = await Promise.all([
      sampleSiteService.getSampleSitesCountBySurveyId(surveyId),
      samplePeriodService.getSamplePeriodsCountForSurvey(surveyId),
      sampleTechniqueService.getSamplingTechniquesCountForSurvey(surveyId),
      observationService.getSurveyObservationsCount(surveyId),
      habitatFeatureService.getSurveyHabitatFeaturesCount(surveyId),
      telemetryDeviceService.getDevicesCount(surveyId),
      telemetryDeploymentService.getDeploymentsCount(surveyId),
      this.attachmentService.getSurveyAttachmentsForBioHubSubmissionCount(surveyId),
      surveyService.getSurveyLocationsData(surveyId),
      this.attachmentService.getSurveyReportAttachments(surveyId),
      surveyCritterService.getCritterbaseSurveyCritters(surveyId),
      sampleSiteService.getSampleSitesForSurveyId(surveyId, {}),
      surveyService.siteSelectionStrategyService.getSiteSelectionDataForBioHubSubmission(surveyId)
    ]);

    let telemetryCount = 0;
    if (telemetryDeploymentCount > 0) {
      const surveyTelemetry = await telemetryVendorService.getTelemetryForSurvey(surveyId, {
        pagination: {
          page: 1,
          limit: 1
        }
      });

      telemetryCount = surveyTelemetry[1].count;
    }

    const featureTypes = this._collectPublishableFeatureTypes({
      sampleSiteCount,
      samplePeriodCount,
      sampleTechniqueCount,
      observationCount,
      habitatFeatureCount,
      telemetryDeviceCount,
      telemetryDeploymentCount,
      telemetryCount,
      surveyAttachmentCount,
      surveyLocations,
      surveyReportAttachments,
      surveyAnimals,
      sampleSitesForBlocks,
      siteSelectionData
    });

    return { featureTypes: [...this.normalizePublishFeatureTypes([...featureTypes])] };
  }

  /**
   * Collect publishable feature types from survey data presence signals.
   *
   * @param {{
   *     sampleSiteCount: number;
   *     samplePeriodCount: number;
   *     sampleTechniqueCount: number;
   *     observationCount: number;
   *     habitatFeatureCount: number;
   *     telemetryDeviceCount: number;
   *     telemetryDeploymentCount: number;
   *     telemetryCount: number;
   *     surveyAttachmentCount: number;
   *     surveyLocations: unknown[];
   *     surveyReportAttachments: ISurveyReportAttachment[];
   *     surveyAnimals: ICritterDetailed[];
   *     sampleSitesForBlocks: { blocks?: unknown[] }[];
   *     siteSelectionData: { stratums: { name: string; description: string }[] };
   *   }} params
   * @return {Set<BiohubFeatureType>}
   * @memberof PlatformService
   */
  private _collectPublishableFeatureTypes(params: {
    sampleSiteCount: number;
    samplePeriodCount: number;
    sampleTechniqueCount: number;
    observationCount: number;
    habitatFeatureCount: number;
    telemetryDeviceCount: number;
    telemetryDeploymentCount: number;
    telemetryCount: number;
    surveyAttachmentCount: number;
    surveyLocations: unknown[];
    surveyReportAttachments: ISurveyReportAttachment[];
    surveyAnimals: ICritterDetailed[];
    sampleSitesForBlocks: { blocks?: unknown[] }[];
    siteSelectionData: { stratums: { name: string; description: string }[] };
  }): Set<BiohubFeatureType> {
    const {
      sampleSiteCount,
      samplePeriodCount,
      sampleTechniqueCount,
      observationCount,
      habitatFeatureCount,
      telemetryDeviceCount,
      telemetryDeploymentCount,
      telemetryCount,
      surveyAttachmentCount,
      surveyLocations,
      surveyReportAttachments,
      surveyAnimals,
      sampleSitesForBlocks,
      siteSelectionData
    } = params;

    const featureTypes = new Set<BiohubFeatureType>();

    if (sampleSiteCount > 0) {
      featureTypes.add(BiohubFeatureType.SAMPLE_SITE);
    }

    if (samplePeriodCount > 0) {
      featureTypes.add(BiohubFeatureType.SAMPLE_PERIOD);
    }

    if (sampleTechniqueCount > 0) {
      featureTypes.add(BiohubFeatureType.SAMPLE_TECHNIQUE);
    }

    if (observationCount > 0) {
      featureTypes.add(BiohubFeatureType.OBSERVATION);
    }

    if (habitatFeatureCount > 0) {
      featureTypes.add(BiohubFeatureType.HABITAT_FEATURE);
    }

    if (telemetryDeviceCount > 0) {
      featureTypes.add(BiohubFeatureType.TELEMETRY_DEVICE);
    }

    if (telemetryDeploymentCount > 0) {
      featureTypes.add(BiohubFeatureType.TELEMETRY_DEPLOYMENT);
      featureTypes.add(BiohubFeatureType.TELEMETRY_FREQUENCY);
    }

    if (telemetryCount > 0) {
      featureTypes.add(BiohubFeatureType.TELEMETRY);
    }

    if (surveyAttachmentCount > 0) {
      featureTypes.add(BiohubFeatureType.FILE);
    }

    if (surveyLocations.length > 0) {
      featureTypes.add(BiohubFeatureType.STUDY_AREA);
    }

    if (surveyReportAttachments.length > 0) {
      featureTypes.add(BiohubFeatureType.REPORT);
    }

    if (siteSelectionData.stratums.length > 0) {
      featureTypes.add(BiohubFeatureType.STRATUM);
    }

    if (
      sampleSitesForBlocks.some(
        (sampleSite: { blocks?: unknown[] }) => Array.isArray(sampleSite.blocks) && sampleSite.blocks.length > 0
      )
    ) {
      featureTypes.add(BiohubFeatureType.BLOCK);
    }

    if (surveyAnimals.length > 0) {
      featureTypes.add(BiohubFeatureType.ANIMAL);
      featureTypes.add(BiohubFeatureType.CAPTURE);
      featureTypes.add(BiohubFeatureType.MORTALITY);
      featureTypes.add(BiohubFeatureType.ECOLOGICAL_UNIT);
      featureTypes.add(BiohubFeatureType.MARKING);
      featureTypes.add(BiohubFeatureType.MEASUREMENT);
      featureTypes.add(BiohubFeatureType.RELEASE);
    }

    return featureTypes;
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
    } catch (_error) {
      return [];
    }
  }

  /**
   * Get taxon by scientific name from the BioHub.
   *
   * @param {string} scientificName - The scientific name of the taxon to search for
   * @returns {*} {Promise<IItisSearchResult | null>} The first matching taxon by scientific name or null if not found
   */
  async getTaxonByScientificName(scientificName: string): Promise<IItisSearchResult | null> {
    defaultLog.debug({ label: 'getTaxonomyByScientificName', scientificName });

    if (!scientificName) {
      return null;
    }

    try {
      const keycloakService = new KeycloakService();

      const token = await keycloakService.getKeycloakServiceToken();

      const backboneTaxonSearchUrl = new URL(getBackboneTaxonPath(), getBackboneInternalApiHost()).href;

      const { data } = await axios.get<{ searchResponse: IItisSearchResult[] }>(backboneTaxonSearchUrl, {
        headers: {
          authorization: `Bearer ${token}`
        },
        params: {
          // Biohub searches ITIS by "terms" -> "alces alces" -> ["alces", "alces"]
          terms: scientificName.split(' ')
        },
        paramsSerializer: (params) => {
          return qs.stringify(params);
        }
      });

      // Find a matching taxon by scientific name (case-insensitive)
      const matchingTaxon = data.searchResponse.find(
        (taxon) => taxon.scientificName.toLowerCase() === scientificName.toLowerCase()
      );

      defaultLog.debug({ label: 'getTaxonByScientificName', matchingTaxon });

      if (!matchingTaxon) {
        return null;
      }

      return matchingTaxon;
    } catch (error) {
      defaultLog.error({ label: 'getTaxonByScientificName', error: formatAxiosError(error) });

      return null;
    }
  }

  /**
   * Submit survey to BioHub.
   *
   * @param {number} surveyId
   * @param {{ submissionComment: string }} data
   * @param {SubmissionSubmitter[]} submitters
   * @return {*}  {Promise<{ submission_uuid: string }>}
   * @memberof PlatformService
   */
  async submitSurveyToBioHub(
    surveyId: number,
    data: PublishSurveyData,
    submitters: SubmissionSubmitter[]
  ): Promise<{ submission_uuid: string }> {
    const includeFeatureTypes = this.normalizePublishFeatureTypes(data.featureTypes);

    defaultLog.debug({ label: 'submitSurveyToBioHub', message: 'params', surveyId });

    if (isFeatureFlagPresent(['API_FF_SUBMIT_BIOHUB'])) {
      throw new ApiGeneralError('Publishing to BioHub is not currently enabled.');
    }

    // If survey was previously published, use existing submission_uuid for re-publish endpoint
    const existingPublishRecord = await this.historyPublishService.getSurveyMetadataPublishRecord(surveyId);
    const existingSubmissionUuid = existingPublishRecord?.submission_uuid ?? null;

    // Get keycloak token for SIMS service client account
    const keycloakService = new KeycloakService();
    const token = await keycloakService.getKeycloakServiceToken();

    // Get survey attachments
    const surveyAttachments = includeFeatureTypes.has(BiohubFeatureType.FILE)
      ? await this.attachmentService.getSurveyAttachmentsForBioHubSubmission(surveyId)
      : [];

    // Get survey report attachments
    const surveyReportAttachments = includeFeatureTypes.has(BiohubFeatureType.REPORT)
      ? await this.attachmentService.getSurveyReportAttachments(surveyId)
      : [];

    // Generate survey data package
    const surveyDataPackage = await this._generateSurveyDataPackage(
      surveyId,
      surveyAttachments,
      surveyReportAttachments,
      data.submissionComment,
      includeFeatureTypes
    );

    // Flatten and save the survey data package grouped by type
    const flattenedData = this._flattenToBlockModel(surveyDataPackage);

    // Find the survey ID (root block with type "survey")
    const surveyBlock = flattenedData.find((block) => block.type === BiohubFeatureType.SURVEY && block.parent === null);
    if (!surveyBlock?.id) {
      throw new ApiError(
        ApiErrorType.UNKNOWN,
        'Failed to find survey ID in survey data package. The survey block is missing or invalid.'
      );
    }
    const archiveRootId = surveyBlock.id;

    // Group blocks by type
    const blocksByType = new Map<string, IFlattenedBlock[]>();
    flattenedData.forEach((block) => {
      const blockType = block.type || 'unknown';
      if (!blocksByType.has(blockType)) {
        blocksByType.set(blockType, []);
      }
      blocksByType.get(blockType)!.push(block);
    });

    // Create TAR archive with PAX format and extended attributes using tar-stream
    const submissionsBaseDir = path.join(process.cwd(), 'data', 'submissions');
    fs.mkdirSync(submissionsBaseDir, { recursive: true });
    const tarFilePath = path.join(submissionsBaseDir, `${archiveRootId}.tar`);
    await this._createTarArchive(archiveRootId, blocksByType, tarFilePath);

    defaultLog.info({
      label: 'submitSurveyToBioHub',
      message: 'Flattened survey data package saved by type and compressed to TAR',
      totalBlocks: flattenedData.length,
      totalTypes: blocksByType.size,
      tarFilePath
    });

    // Get TAR file size for multipart upload
    const tarFileSize = fs.statSync(tarFilePath).size;

    // Step 1: Initiate upload and get presigned URLs
    const { uploadId, s3UploadId, key, presignedUrls, partCount, submissionUuid, submissionUploadId } =
      await this._initiateSubmissionUpload(
        token,
        tarFileSize,
        surveyDataPackage,
        data.submissionComment,
        existingSubmissionUuid,
        submitters
      );

    defaultLog.info({
      label: 'submitSurveyToBioHub',
      message: 'Initiated multipart upload',
      uploadId,
      submissionUuid,
      submissionUploadId,
      partCount
    });

    try {
      // Step 2: Upload TAR file parts to S3
      const parts = await this._uploadTarFileParts(tarFilePath, presignedUrls, partCount);

      // Step 3: Complete the upload
      await this._completeSubmissionUpload(token, uploadId, s3UploadId, key, parts);

      defaultLog.info({
        label: 'submitSurveyToBioHub',
        message: 'Successfully completed multipart upload',
        uploadId,
        submissionUuid
      });
    } finally {
      // Clean up TAR file
      try {
        fs.unlinkSync(tarFilePath);
        defaultLog.info({
          label: 'submitSurveyToBioHub',
          message: 'TAR file cleaned up',
          tarFilePath
        });
      } catch (cleanupError) {
        defaultLog.warn({
          label: 'submitSurveyToBioHub',
          message: 'Failed to clean up TAR file',
          tarFilePath,
          error: cleanupError instanceof Error ? cleanupError.message : 'Unknown error'
        });
      }
    }

    // Insert or update publish history record using the UUID returned by BioHub.
    await this.historyPublishService.insertSurveyMetadataPublishRecord({
      survey_id: surveyId,
      submission_uuid: submissionUuid
    });

    return { submission_uuid: submissionUuid };
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
    submissionComment: string,
    includeFeatureTypes?: Set<BiohubFeatureType>
  ): Promise<PostSurveySubmissionToBioHubObject> {
    const observationService = new ObservationService(this.connection);
    const surveyService = new SurveyService(this.connection);
    const surveyCritterService = new SurveyCritterService(this.connection);
    const codeService = new CodeService(this.connection);
    const sampleSiteService = new SampleSiteService(this.connection);
    const samplePeriodService = new SamplePeriodService(this.connection);
    const sampleTechniqueService = new SampleTechniqueService(this.connection);
    const habitatFeatureService = new SurveyHabitatFeatureService(this.connection);
    const telemetryDeviceService = new TelemetryDeviceService(this.connection);
    const telemetryDeploymentService = new TelemetryDeploymentService(this.connection);
    const telemetryVendorService = new TelemetryVendorService(this.connection);

    // Get survey data
    const survey = await surveyService.getSurveyData(surveyId);

    const shouldIncludeObservations = includeFeatureTypes?.has(BiohubFeatureType.OBSERVATION) ?? true;
    const observationData = shouldIncludeObservations
      ? await observationService.getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData(surveyId)
      : {
          surveyObservations: [],
          supplementaryObservationData: {
            qualitative_environments: [],
            quantitative_environments: [],
            qualitative_measurements: [],
            quantitative_measurements: []
          }
        };
    const surveyObservations = observationData.surveyObservations;
    const purposeAndMethodology = await surveyService.getSurveyPurposeAndMethodology(surveyId);
    const surveyLocation =
      (includeFeatureTypes?.has(BiohubFeatureType.STUDY_AREA) ?? true)
        ? await surveyService.getSurveyLocationsData(surveyId)
        : [];

    // Get partnerships and focal species data for BioHub submission
    const partnerships = await surveyService.getSurveyPartnershipsData(surveyId);
    const focalSpecies = await surveyService.getSpeciesData(surveyId);

    // Get site selection strategy data for BioHub submission (with IDs)
    const siteSelectionData =
      await surveyService.siteSelectionStrategyService.getSiteSelectionDataForBioHubSubmission(surveyId);

    // Get all codes
    const allCodes = await codeService.getAllCodeSets();

    // Extract environmental definitions for mapping IDs to names
    const environmentDefinitions = {
      qualitative_environments: observationData.supplementaryObservationData.qualitative_environments,
      quantitative_environments: observationData.supplementaryObservationData.quantitative_environments
    };

    // Extract measurement definitions for mapping IDs to names
    const measurementDefinitions = {
      qualitative_measurements: observationData.supplementaryObservationData.qualitative_measurements,
      quantitative_measurements: observationData.supplementaryObservationData.quantitative_measurements
    };

    // Get sampling sites and periods data for survey
    const surveySamplingSitesNonSpatial =
      (includeFeatureTypes?.has(BiohubFeatureType.SAMPLE_SITE) ?? true)
        ? await sampleSiteService.getSampleSitesForSurveyId(surveyId, {})
        : [];
    const surveySamplingSitesGeometry =
      (includeFeatureTypes?.has(BiohubFeatureType.SAMPLE_SITE) ?? true)
        ? await sampleSiteService.getSampleSitesGeometryBySurveyId(surveyId)
        : [];
    const surveySamplingPeriods =
      (includeFeatureTypes?.has(BiohubFeatureType.SAMPLE_PERIOD) ?? true)
        ? await samplePeriodService.getSamplePeriodsForSurvey(surveyId, {})
        : [];
    const surveySamplingTechniques =
      (includeFeatureTypes?.has(BiohubFeatureType.SAMPLE_TECHNIQUE) ?? true)
        ? await sampleTechniqueService.getSamplingTechniquesForSurvey(surveyId)
        : [];

    // Merge sampling sites with their geometry data
    const surveysamplingSites = surveySamplingSitesNonSpatial.map((site) => {
      const geometryData = surveySamplingSitesGeometry.find(
        (geometry) => geometry.survey_sample_site_id === site.survey_sample_site_id
      );
      return {
        ...site,
        geojson: geometryData?.geojson || null
      };
    });

    // Get habitat features data for survey
    const surveyHabitatFeatures =
      (includeFeatureTypes?.has(BiohubFeatureType.HABITAT_FEATURE) ?? true)
        ? await habitatFeatureService.getSurveyHabitatFeatures(surveyId)
        : [];

    // Get telemetry data for survey
    const surveyTelemetryDevices =
      (includeFeatureTypes?.has(BiohubFeatureType.TELEMETRY_DEVICE) ?? true)
        ? await telemetryDeviceService.getDevicesForSurvey(surveyId)
        : [];
    const surveyTelemetryDeployments =
      (includeFeatureTypes?.has(BiohubFeatureType.TELEMETRY_DEPLOYMENT) ?? true)
        ? await telemetryDeploymentService.getDeploymentsForSurvey(surveyId)
        : [];

    // Get telemetry data points for deployments
    const deploymentIds = surveyTelemetryDeployments.map((deployment) => deployment.deployment_id);
    const surveyTelemetry =
      (includeFeatureTypes?.has(BiohubFeatureType.TELEMETRY) ?? true) && deploymentIds.length > 0
        ? await telemetryVendorService.getTelemetryForDeployments(surveyId, deploymentIds)
        : [];

    // Get all codeset categories for BioHub submission
    const codesetCategories = await codeService.getAllCodesetCategories();

    // Get survey animals from Critterbase (via SIMS survey-critter associations)
    const shouldIncludeAnimals =
      (includeFeatureTypes?.has(BiohubFeatureType.ANIMAL) ?? true) ||
      includeFeatureTypes?.has(BiohubFeatureType.TELEMETRY_DEPLOYMENT) === true;
    const surveyAnimals = shouldIncludeAnimals ? await surveyCritterService.getCritterbaseSurveyCritters(surveyId) : [];

    // Enrich mortality data with detailed information
    const enrichedSurveyAnimals: ICritterDetailed[] = await Promise.all(
      surveyAnimals.map(async (animal) => {
        if (animal.mortality && Array.isArray(animal.mortality) && animal.mortality.length > 0) {
          // Fetch detailed mortality data for the first mortality record
          // Note: Interface expects singular mortality, but data may contain array
          const firstMortality = (animal.mortality as any[])[0];
          if (firstMortality?.mortality_id) {
            try {
              const detailedMortality = await surveyCritterService.getDetailedMortalityById(
                firstMortality.mortality_id
              );
              return { ...animal, mortality: detailedMortality } as ICritterDetailed;
            } catch (error) {
              // If detailed data fetch fails, use the basic mortality data
              defaultLog.warn({
                label: 'submitSurveyToBioHub',
                message: 'Failed to fetch detailed mortality data',
                mortality_id: firstMortality.mortality_id,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
              return { ...animal, mortality: firstMortality } as ICritterDetailed;
            }
          }
        }
        return animal;
      })
    );

    const geometryFeatureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: surveyLocation.flatMap((location) => location.geojson as Feature[])
    };

    // Generate survey data package
    const surveyDataPackage = new PostSurveySubmissionToBioHubObject(
      survey,
      purposeAndMethodology,
      surveyObservations,
      {
        surveyGeometry: geometryFeatureCollection,
        surveyAttachments,
        surveyReports: surveyReportAttachments,
        submissionComment
      },
      {
        animalRecords: enrichedSurveyAnimals,
        environmentDefinitions,
        measurementDefinitions,
        samplingSites: surveysamplingSites,
        samplingPeriods: surveySamplingPeriods,
        samplingTechniques: surveySamplingTechniques,
        habitatFeatures: surveyHabitatFeatures,
        telemetryDevices: surveyTelemetryDevices,
        telemetryDeployments: surveyTelemetryDeployments,
        telemetry: surveyTelemetry,
        partnerships,
        focalSpecies,
        surveyLocation,
        firstNations: allCodes.first_nations,
        strata: (includeFeatureTypes?.has(BiohubFeatureType.STRATUM) ?? true) ? siteSelectionData.stratums : [],
        siteSelectionStrategies: siteSelectionData.strategies,
        codesetCategories,
        includeFeatureTypes
      }
    );

    return surveyDataPackage;
  }

  /**
   * Flattens a nested JSON structure using Notion's block data model.
   * Each block has an ID, properties, and content (array of child block IDs).
   * Each block also has a parent reference for permissions.
   *
   * @param {any} data - The nested data structure to flatten
   * @return {*}  {IFlattenedBlock[]}
   * @memberof PlatformService
   */
  _flattenToBlockModel(data: any): IFlattenedBlock[] {
    const blocks = new Map<string, IFlattenedBlock>();

    const processBlock = (block: INestedBlock, parentId: string | null = null): string => {
      const blockId = block.id;

      // Create the flattened block
      const flatBlock: IFlattenedBlock = {
        id: blockId,
        type: block.type || 'unknown',
        properties: block.properties || {},
        content: [], // Will be populated with child block IDs
        parent: parentId
      };

      // Add to blocks map
      blocks.set(blockId, flatBlock);

      // Process child features and collect their IDs
      if (block.child_features && Array.isArray(block.child_features)) {
        for (const childBlock of block.child_features) {
          // Recursively process child block
          processBlock(childBlock, blockId);
          // Codeset is a reference/lookup table written to codes/codeset.json,
          // not a content feature, so exclude it from the parent's content array.
          if (childBlock.type !== BiohubFeatureType.CODESET) {
            flatBlock.content.push(childBlock.id);
          }
        }
      }

      return blockId;
    };

    // Handle root-level structure
    // The main content block should be the root, not the wrapper
    if (data.content) {
      // Process the main content block as root
      processBlock(data.content, null);
    }

    // Convert Map to array for JSON serialization
    return Array.from(blocks.values());
  }

  /**
   * Creates a TAR archive with PAX format containing flattened JSON files.
   *
   * @param {string} archiveRootId - The archive root ID
   * @param {Map<string, IFlattenedBlock[]>} blocksByType - Map of block types to their flattened blocks
   * @param {string} tarFilePath - Full path where the TAR file should be created
   * @return {*}  {Promise<void>}
   * @memberof PlatformService
   */
  async _createTarArchive(
    archiveRootId: string,
    blocksByType: Map<string, IFlattenedBlock[]>,
    tarFilePath: string
  ): Promise<void> {
    const pack = tarStream.pack();
    const outputStream = fs.createWriteStream(tarFilePath);

    pack.pipe(outputStream);

    // Wait for the stream to finish
    const streamPromise = new Promise<void>((resolve, reject) => {
      outputStream.on('close', resolve);
      pack.on('error', reject);
      outputStream.on('error', reject);
    });

    // Add the archive root directory entry
    pack.entry(
      {
        name: `${archiveRootId}/`,
        type: 'directory'
      },
      undefined,
      (dirErr?: Error | null) => {
        if (dirErr) {
          pack.destroy();
          throw dirErr;
        }
        this._addMetadataFile(pack, archiveRootId, blocksByType);
      }
    );

    await streamPromise;
  }

  /**
   * Adds metadata file and JSON files to the TAR archive.
   *
   * @param {tarStream.Pack} pack - The TAR pack stream
   * @param {string} archiveRootId - The archive root ID
   * @param {Map<string, IFlattenedBlock[]>} blocksByType - Map of block types to their flattened blocks
   * @memberof PlatformService
   */
  _addMetadataFile(pack: tarStream.Pack, archiveRootId: string, blocksByType: Map<string, IFlattenedBlock[]>): void {
    // Add a metadata file with the archive root ID
    // Note: tar-stream doesn't easily support PAX extended attributes,
    // so we store the archive root ID in a metadata file instead
    const metadataContent = Buffer.from(archiveRootId);
    pack.entry(
      {
        name: `${archiveRootId}/.survey-id`,
        size: metadataContent.length
      },
      metadataContent,
      (metadataErr?: Error | null) => {
        if (metadataErr) {
          pack.destroy();
          throw metadataErr;
        }
        // Start adding JSON files and file blocks (async operation)
        this._addJsonFiles(pack, archiveRootId, blocksByType).catch((error) => {
          defaultLog.error({
            label: '_addMetadataFile',
            message: 'Failed to add JSON files and file blocks',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          pack.destroy();
          throw error;
        });
      }
    );
  }

  /**
   * Adds all JSON files from the blocksByType Map to the TAR archive and then triggers the addition
   * of binary file content. Codeset content is written to `codes/codeset.json`; all other feature
   * blocks are written under `features/`.
   *
   * @param {tarStream.Pack} pack - The TAR pack stream
   * @param {string} archiveRootId - The archive root ID
   * @param {Map<string, IFlattenedBlock[]>} blocksByType - Map of block types to their flattened blocks
   * @return {*}  {Promise<void>}
   * @memberof PlatformService
   */
  async _addJsonFiles(
    pack: tarStream.Pack,
    archiveRootId: string,
    blocksByType: Map<string, IFlattenedBlock[]>
  ): Promise<void> {
    if (blocksByType.size === 0) {
      pack.finalize();
      return;
    }

    const fileBlocks = blocksByType.get('file') || [];

    await Promise.all([
      this._addJsonFilesToArchive(pack, archiveRootId, blocksByType),
      this._addFileBlocksToArchive(pack, archiveRootId, fileBlocks)
    ]);
    pack.finalize();
  }

  /**
   * Adds JSON files for all block types to the TAR archive by delegating to _addFeatureToArchive
   * or _addCodesetToArchive.
   *
   * @param {tarStream.Pack} pack - The TAR pack stream
   * @param {string} archiveRootId - The archive root ID
   * @param {Map<string, IFlattenedBlock[]>} blocksByType - Map of block types to their flattened blocks
   * @return {Promise<void>} Resolves when all JSON files have been added to the archive
   * @memberof PlatformService
   */
  _addJsonFilesToArchive(
    pack: tarStream.Pack,
    archiveRootId: string,
    blocksByType: Map<string, IFlattenedBlock[]>
  ): Promise<void> {
    const promises = Array.from(blocksByType.entries()).map(([type, blocks]) =>
      type === TARBALL_FILE_ROLE.CODESET
        ? this._addCodesetToArchive(pack, archiveRootId, blocks)
        : this._addFeatureToArchive(pack, archiveRootId, type, blocks)
    );
    return Promise.all(promises).then(() => undefined);
  }

  /**
   * Adds a feature JSON file for a specific block type to the TAR archive.
   *
   * @param {tarStream.Pack} pack - The TAR pack stream
   * @param {string} archiveRootId - The archive root ID
   * @param {string} type - The block type (feature name)
   * @param {IFlattenedBlock[]} blocks - Flattened blocks of this type
   * @return {Promise<void>} Resolves when the file has been added to the archive
   * @memberof PlatformService
   */
  _addFeatureToArchive(
    pack: tarStream.Pack,
    archiveRootId: string,
    type: string,
    blocks: IFlattenedBlock[]
  ): Promise<void> {
    const fileName = `features/${type}.json`;
    const fileContent = Buffer.from(JSON.stringify(blocks, null, 2));
    return this._addFileToArchive(pack, archiveRootId, fileName, fileContent);
  }

  /**
   * Adds the consolidated codeset JSON file to the TAR archive.
   *
   * @param {tarStream.Pack} pack - The TAR pack stream
   * @param {string} archiveRootId - The archive root ID
   * @param {IFlattenedBlock[]} codesetBlocks - Flattened codeset blocks (expected to contain a single codeset feature)
   * @return {Promise<void>} Resolves when the file has been added to the archive
   * @memberof PlatformService
   */
  _addCodesetToArchive(pack: tarStream.Pack, archiveRootId: string, codesetBlocks: IFlattenedBlock[]): Promise<void> {
    const fileName = 'codes/codeset.json';
    const payload =
      codesetBlocks.length > 0 && codesetBlocks[0].properties !== undefined
        ? codesetBlocks[0].properties
        : codesetBlocks;
    const fileContent = Buffer.from(JSON.stringify(payload, null, 2));
    return this._addFileToArchive(pack, archiveRootId, fileName, fileContent);
  }

  /**
   * Adds actual file content for file type blocks to the TAR archive.
   *
   * @param {tarStream.Pack} pack - The TAR pack stream
   * @param {string} archiveRootId - The archive root ID
   * @param {IFlattenedBlock[]} fileBlocks - Array of file blocks to process
   * @return {Promise<void>} Resolves when all file blocks have been added to the archive
   * @memberof PlatformService
   */
  async _addFileBlocksToArchive(
    pack: tarStream.Pack,
    archiveRootId: string,
    fileBlocks: IFlattenedBlock[]
  ): Promise<void> {
    if (fileBlocks.length === 0) {
      return;
    }

    for (const fileBlock of fileBlocks) {
      await this._processFileBlock(pack, archiveRootId, fileBlock);
    }
  }

  /**
   * Processes a single file block by downloading from S3 and adding to archive.
   *
   * @param {tarStream.Pack} pack - The TAR pack stream
   * @param {string} archiveRootId - The archive root ID
   * @param {IFlattenedBlock} fileBlock - The file block to process
   * @return {Promise<void>} Resolves when the file block has been processed (added or skipped)
   * @memberof PlatformService
   */
  async _processFileBlock(pack: tarStream.Pack, archiveRootId: string, fileBlock: IFlattenedBlock): Promise<void> {
    try {
      const artifactKey = fileBlock.properties?.artifact_key as string | undefined;
      const filename = (fileBlock.properties?.filename as string | undefined) || fileBlock.id;

      if (!artifactKey) {
        this._logFileBlockWarning('File block missing artifact_key, skipping', fileBlock.id);
        return;
      }

      const fileContent = await this._downloadFileFromS3(artifactKey, fileBlock.id);
      if (!fileContent) {
        return;
      }

      const archivePath = `files/${filename}`;
      await this._addFileToArchive(pack, archiveRootId, archivePath, fileContent);
    } catch (error) {
      this._logFileBlockError('Failed to add file block to archive', fileBlock.id, error);
    }
  }

  /**
   * Downloads a file from S3 and converts it to a Buffer.
   *
   * @param {string} artifactKey - The S3 key for the file
   * @param {string} blockId - The block ID for logging
   * @return {*}  {Promise<Buffer | null>} The file content as a Buffer, or null if download fails
   * @memberof PlatformService
   */
  async _downloadFileFromS3(artifactKey: string, blockId: string): Promise<Buffer | null> {
    try {
      const s3File = await getFileFromS3(artifactKey);

      if (!s3File.Body) {
        this._logFileBlockWarning('S3 file Body is null, skipping', blockId, artifactKey);
        return null;
      }

      return (await s3File.Body.transformToByteArray()) as Buffer;
    } catch (error) {
      this._logFileBlockError('Failed to download file from S3', blockId, error, artifactKey);
      return null;
    }
  }

  /**
   * Logs a warning for file block processing.
   *
   * @param {string} message - Warning message
   * @param {string} blockId - The block ID
   * @param {string} [artifactKey] - Optional artifact key for additional context
   * @memberof PlatformService
   */
  _logFileBlockWarning(message: string, blockId: string, artifactKey?: string): void {
    defaultLog.warn({
      label: '_addJsonFiles',
      message,
      blockId,
      ...(artifactKey && { artifactKey })
    });
  }

  /**
   * Logs an error for file block processing.
   *
   * @param {string} message - Error message
   * @param {string} blockId - The block ID
   * @param {unknown} error - The error object
   * @param {string} [artifactKey] - Optional artifact key for additional context
   * @memberof PlatformService
   */
  _logFileBlockError(message: string, blockId: string, error: unknown, artifactKey?: string): void {
    defaultLog.error({
      label: '_addJsonFiles',
      message,
      blockId,
      error: error instanceof Error ? error.message : 'Unknown error',
      ...(artifactKey && { artifactKey })
    });
  }

  /**
   * Adds a single file to the TAR archive from memory.
   *
   * @param {tarStream.Pack} pack - The TAR pack stream
   * @param {string} archiveRootId - The archive root ID
   * @param {string} fileName - Filename to add
   * @param {Buffer} fileContent - File content as a Buffer
   * @return {Promise<void>} Resolves when the file entry has been written to the pack
   * @memberof PlatformService
   */
  _addFileToArchive(pack: tarStream.Pack, archiveRootId: string, fileName: string, fileContent: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      pack.entry(
        {
          name: `${archiveRootId}/${fileName}`,
          size: fileContent.length
        },
        fileContent,
        (entryErr?: Error | null) => {
          if (entryErr) {
            pack.destroy();
            reject(entryErr);
            return;
          }
          resolve();
        }
      );
    });
  }

  /**
   * Initiates a multipart upload to BioHub and gets presigned URLs for S3.
   * When existingSubmissionUuid is set, uses /submission/:submissionUuid/upload for re-publish.
   *
   * @param {string} token - Keycloak service token
   * @param {number} tarFileSize - Size of the TAR file in bytes
   * @param {PostSurveySubmissionToBioHubObject} surveyDataPackage - Survey data package
   * @param {string} submissionComment - Comment for the submission
   * @param {string | null} existingSubmissionUuid - When set, initiate upload for this existing submission (re-publish)
   * @param {SubmissionSubmitter[]} submitters - Users who should receive access
   * @return {*}  {Promise<SubmissionUploadInitiateResponse>}
   * @memberof PlatformService
   */
  async _initiateSubmissionUpload(
    token: string,
    tarFileSize: number,
    surveyDataPackage: PostSurveySubmissionToBioHubObject,
    submissionComment: string,
    existingSubmissionUuid: string | null,
    submitters: SubmissionSubmitter[] = []
  ): Promise<SubmissionUploadInitiateResponse> {
    defaultLog.debug({
      label: '_initiateSubmissionUpload',
      tarFileSize,
      existingSubmissionUuid: !!existingSubmissionUuid
    });

    // Validate file size
    const SUBMISSION_UPLOAD_MAX_SIZE = getEnvironmentVariable('SUBMISSION_UPLOAD_MAX_SIZE');
    if (tarFileSize > SUBMISSION_UPLOAD_MAX_SIZE) {
      throw new ApiError(
        ApiErrorType.UNKNOWN,
        `TAR file size (${tarFileSize} bytes) exceeds maximum allowed size (${SUBMISSION_UPLOAD_MAX_SIZE} bytes)`
      );
    }

    // Create submission upload URL: first-time = {base}/upload/archive, re-publish = {base}/{submission_uuid}/upload
    // Normalize base: strip trailing /upload/archive so env can be /api/submission or /api/submission/upload/archive
    const rawPath = getBackboneSubmissionUploadPath();
    const basePath = rawPath.replace(/\/upload\/archive\/?$/, '') || rawPath;
    const initiatePath = existingSubmissionUuid
      ? `${basePath}/${existingSubmissionUuid}/upload`
      : `${basePath}/upload/archive`;
    const backboneSubmissionUploadUrl = new URL(initiatePath, getBackboneInternalApiHost()).href;

    // Prepare request body
    const requestBody: CreateSubmissionRequest | CreateExistingSubmissionUploadRequest = existingSubmissionUuid
      ? {
          bytes: tarFileSize,
          submitters
        }
      : {
          bytes: tarFileSize,
          name: surveyDataPackage.name,
          description: surveyDataPackage.description,
          comment: submissionComment,
          submitters
        };

    try {
      const response = await axios.post<SubmissionUploadInitiateResponse>(backboneSubmissionUploadUrl, requestBody, {
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      defaultLog.info({
        label: '_initiateSubmissionUpload',
        message: 'Received presigned URLs',
        submissionUuid: response.data.submissionUuid,
        submissionUploadId: response.data.submissionUploadId,
        uploadId: response.data.uploadId,
        partCount: response.data.partCount
      });

      defaultLog.debug({
        label: '_initiateSubmissionUpload',
        message: 'BioHub initiate response (full)',
        uploadId: response.data.uploadId,
        submissionUuid: response.data.submissionUuid,
        submissionUploadId: response.data.submissionUploadId,
        fullResponse: response.data
      });

      return response.data;
    } catch (error) {
      defaultLog.error({
        label: '_initiateSubmissionUpload',
        message: 'Failed to initiate submission upload',
        url: backboneSubmissionUploadUrl,
        error: formatAxiosError(error)
      });
      throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to initiate submission upload to BioHub');
    }
  }

  /**
   * Builds byte ranges for multipart upload directly from backend part instructions.
   *
   * @param {number} fileSize - TAR file size in bytes
   * @param {UploadPart[]} orderedPresignedParts - Presigned parts sorted by part number
   * @return {*}  {UploadPartByteRange[]}
   * @memberof PlatformService
   */
  _buildPartByteRanges(fileSize: number, orderedPresignedParts: UploadPart[]): UploadPartByteRange[] {
    if (!orderedPresignedParts.length) {
      throw new Error('Part count must be positive');
    }

    const expectedBytes = orderedPresignedParts.reduce((sum, part) => sum + part.partSizeBytes, 0);
    if (expectedBytes !== fileSize) {
      throw new Error('Part instructions do not match file size.');
    }

    const partRanges: UploadPartByteRange[] = [];
    let start = 0;

    for (const part of orderedPresignedParts) {
      if (!Number.isFinite(part.partSizeBytes) || part.partSizeBytes <= 0) {
        throw new Error(`Invalid part size for part ${part.partNumber}.`);
      }

      const end = start + part.partSizeBytes - 1;
      partRanges.push({
        ...part,
        start,
        end
      });
      start += part.partSizeBytes;
    }

    return partRanges;
  }

  /**
   * Uploads a single chunk to S3 using a presigned URL.
   *
   * @param {string} presignedUrl - The presigned S3 URL
   * @param {NodeJS.ReadableStream} chunk - The chunk data stream to upload
   * @param {number} partNumber - The part number (1-indexed)
   * @return {*}  {Promise<UploadResult>}
   * @memberof PlatformService
   */
  async _uploadChunkToS3(
    presignedUrl: string,
    chunk: NodeJS.ReadableStream,
    partNumber: number,
    partSizeBytes?: number
  ): Promise<UploadResult> {
    try {
      const response = await axios.put(presignedUrl, chunk, {
        headers: {
          'Content-Type': 'application/x-tar',
          ...(partSizeBytes ? { 'Content-Length': String(partSizeBytes) } : {})
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      if (response.status !== 200) {
        throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`);
      }

      const etag = response.headers.etag || response.headers.ETag;
      if (!etag) {
        throw new Error(`No ETag returned from S3 upload for part ${partNumber}`);
      }

      const cleanEtag = etag.replaceAll('"', '');

      defaultLog.debug({
        label: '_uploadChunkToS3',
        message: 'Chunk uploaded successfully',
        partNumber,
        etag: cleanEtag
      });

      return {
        PartNumber: partNumber,
        ETag: cleanEtag
      };
    } catch (error) {
      defaultLog.error({
        label: '_uploadChunkToS3',
        message: 'Failed to upload chunk to S3',
        partNumber,
        error: formatAxiosError(error)
      });

      throw new Error(`Failed to upload part ${partNumber} to S3`);
    }
  }

  /**
   * Uploads TAR file parts to S3 using presigned URLs with concurrency control.
   *
   * Part boundaries are derived from `presignedUrls[].partSizeBytes`, so each
   * uploaded chunk aligns with the backend-issued multipart layout.
   *
   * @param {string} tarFilePath - Path to the TAR file
   * @param {UploadPart[]} presignedUrls - Array of presigned URLs with per-part sizes
   * @param {number} partCount - Total number of parts
   * @param {UploadTarFilePartsOptions} options - Optional upload settings
   * @return {*}  {Promise<UploadResult[]>} Array of uploaded parts with ETags
   * @memberof PlatformService
   */
  async _uploadTarFileParts(
    tarFilePath: string,
    presignedUrls: UploadPart[],
    partCount: number,
    options: UploadTarFilePartsOptions = {}
  ): Promise<UploadResult[]> {
    const { concurrencyLimit = 4 } = options;
    if (!Number.isInteger(concurrencyLimit) || concurrencyLimit <= 0) {
      throw new Error('concurrencyLimit must be a positive integer');
    }

    defaultLog.debug({
      label: '_uploadTarFileParts',
      tarFilePath,
      partCount,
      presignedUrlCount: presignedUrls.length
    });

    if (presignedUrls.length !== partCount) {
      throw new Error(
        `Presigned URL count (${presignedUrls.length}) does not match expected part count (${partCount})`
      );
    }

    const orderedPresignedUrls = [...presignedUrls].sort((a, b) => a.partNumber - b.partNumber);
    const fileSize = fs.statSync(tarFilePath).size;
    const partRanges = this._buildPartByteRanges(fileSize, orderedPresignedUrls);
    const results: UploadResult[] = [];

    for (let i = 0; i < partRanges.length; i += concurrencyLimit) {
      const partBatch = partRanges.slice(i, i + concurrencyLimit);

      const batchResults = await Promise.all(
        partBatch.map((part) =>
          this._uploadChunkToS3(
            part.url,
            fs.createReadStream(tarFilePath, { start: part.start, end: part.end }),
            part.partNumber,
            part.partSizeBytes
          )
        )
      );

      results.push(...batchResults);
    }

    const parts = results.sort((a, b) => a.PartNumber - b.PartNumber);

    defaultLog.info({
      label: '_uploadTarFileParts',
      message: 'All parts uploaded successfully',
      totalParts: parts.length
    });

    return parts;
  }

  /**
   * Completes the multipart upload to BioHub.
   *
   * @param {string} token - Keycloak service token
   * @param {string} uploadId - Upload ID from initiate response
   * @param {string} s3UploadId - S3 upload ID from initiate response
   * @param {string} key - S3 key from initiate response
   * @param {UploadResult[]} parts - Array of uploaded parts with ETags
   * @return {*}  {Promise<void>}
   * @memberof PlatformService
   */
  async _completeSubmissionUpload(
    token: string,
    uploadId: string,
    s3UploadId: string,
    key: string,
    parts: UploadResult[]
  ): Promise<void> {
    defaultLog.debug({ label: '_completeSubmissionUpload', uploadId, partCount: parts.length });

    // Create upload complete URL
    const backboneUploadCompleteUrl = new URL(
      `${getBackboneUploadCompletePath()}/${uploadId}`,
      getBackboneInternalApiHost()
    ).href;

    // Prepare request body
    const requestBody = {
      s3UploadId,
      key,
      parts
    };

    try {
      await axios.put(backboneUploadCompleteUrl, requestBody, {
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      defaultLog.info({
        label: '_completeSubmissionUpload',
        message: 'Upload completed successfully',
        uploadId
      });
    } catch (error) {
      defaultLog.error({
        label: '_completeSubmissionUpload',
        message: 'Failed to complete submission upload',
        uploadId,
        error: formatAxiosError(error)
      });
      throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to complete submission upload to BioHub');
    }
  }

  /**
   * Resolves and validates a survey-linked submission UUID.
   *
   * @param {string} submissionId - Submission UUID
   * @param {number} surveyId - SIMS survey ID
   * @return {*}  {Promise<string | null>}
   * @memberof PlatformService
   */
  async _validateSubmissionSurvey(submissionId: string, surveyId: number): Promise<string | null> {
    const publishRecord =
      await this.historyPublishService.findSurveyMetadataPublishRecordBySubmissionUuid(submissionId);

    if (publishRecord?.survey_id !== surveyId) {
      return null;
    }

    return publishRecord.submission_uuid;
  }

  /**
   * Get submission upload history from BioHub.
   *
   * @param {number} surveyId - SIMS Survey ID
   * @param {string} submissionId - Submission UUID
   * @return {*}  {Promise<ISubmissionHistoryRow[] | null>}
   * @memberof PlatformService
   */
  async getSubmissionHistoryForSurvey(surveyId: number, submissionId: string): Promise<ISubmissionHistoryRow[] | null> {
    const validatedSubmissionUuid = await this._validateSubmissionSurvey(submissionId, surveyId);
    if (!validatedSubmissionUuid) {
      return null;
    }

    const keycloakService = new KeycloakService();
    const token = await keycloakService.getKeycloakServiceToken();
    const url = new URL(`/submission/${validatedSubmissionUuid}/history`, getBackboneInternalApiHost()).href;

    try {
      const response = await axios.get<IBioHubSubmissionHistoryRow[] | IBioHubWrappedSubmissionHistoryResponse>(url, {
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = response.data;
      if (Array.isArray(data)) {
        return data ?? [];
      }

      return (data.history ?? []).map((item) => ({
        submissionUploadId: item.submissionUploadId,
        status: item.status,
        createDate: item.createDate,
        submissionId: data.submissionId
      }));
    } catch (error) {
      defaultLog.error({
        label: 'getSubmissionHistory',
        message: 'Failed to get submission history from BioHub',
        submissionId,
        error: formatAxiosError(error)
      });
      throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to get submission history from BioHub');
    }
  }

  /**
   * Soft-delete a submission upload in BioHub (only when status is submitted).
   *
   * @param {number} surveyId - SIMS Survey ID
   * @param {string} submissionId - Submission UUID
   * @param {string} submissionUploadId - Submission upload UUID
   * @return {*}  {Promise<boolean>}
   * @memberof PlatformService
   */
  async deleteSubmissionUploadForSurvey(
    surveyId: number,
    submissionId: string,
    submissionUploadId: string
  ): Promise<boolean> {
    const validatedSubmissionUuid = await this._validateSubmissionSurvey(submissionId, surveyId);
    if (!validatedSubmissionUuid) {
      return false;
    }

    const keycloakService = new KeycloakService();
    const token = await keycloakService.getKeycloakServiceToken();
    const url = new URL(
      `/submission/${validatedSubmissionUuid}/upload/${submissionUploadId}`,
      getBackboneInternalApiHost()
    ).href;

    try {
      await axios.delete(url, {
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return true;
    } catch (error) {
      defaultLog.error({
        label: 'deleteSubmissionUpload',
        message: 'Failed to delete submission upload in BioHub',
        submissionId,
        submissionUploadId,
        error: formatAxiosError(error)
      });
      throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to delete submission upload in BioHub');
    }
  }
}
