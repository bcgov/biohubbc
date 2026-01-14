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
import { PostSurveySubmissionToBioHubObject } from '../models/biohub-create';
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

    // Get keycloak token for SIMS service client account
    const keycloakService = new KeycloakService();
    const token = await keycloakService.getKeycloakServiceToken();

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

    // Flatten and save the survey data package grouped by type
    const flattenedData = this._flattenToBlockModel(surveyDataPackage);

    // Find the dataset ID (root block with type "dataset")
    const datasetBlock = flattenedData.find((block) => block.type === 'dataset' && block.parent === null);
    if (!datasetBlock?.id) {
      throw new ApiError(
        ApiErrorType.UNKNOWN,
        'Failed to find dataset ID in survey data package. The dataset block is missing or invalid.'
      );
    }
    const datasetId = datasetBlock.id;

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
    const tarFilePath = path.join(submissionsBaseDir, `${datasetId}.tar`);
    await this._createTarArchive(datasetId, blocksByType, tarFilePath);

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
    const { uploadId, s3UploadId, key, presignedUrls, partCount, submissionId } = await this._initiateSubmissionUpload(
      token,
      tarFileSize,
      surveyDataPackage,
      data.submissionComment
    );

    defaultLog.info({
      label: 'submitSurveyToBioHub',
      message: 'Initiated multipart upload',
      uploadId,
      submissionId,
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
        submissionId
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

    // Insert publish history record
    await this.historyPublishService.insertSurveyMetadataPublishRecord({
      survey_id: surveyId,
      submission_uuid: uploadId
    });

    return { submission_uuid: uploadId };
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

    // Get all survey observations with environmental data
    const observationData =
      await observationService.getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData(surveyId);
    const surveyObservations = observationData.surveyObservations;
    const purposeAndMethodology = await surveyService.getSurveyPurposeAndMethodology(surveyId);
    const surveyLocation = await surveyService.getSurveyLocationsData(surveyId);

    // Get partnerships and focal species data for BioHub submission
    const partnerships = await surveyService.getSurveyPartnershipsData(surveyId);
    const focalSpecies = await surveyService.getSpeciesData(surveyId);

    // Get site selection strategy data for BioHub submission
    const siteSelectionData = await surveyService.siteSelectionStrategyService.getSiteSelectionDataBySurveyId(surveyId);

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
    const surveySamplingSitesNonSpatial = await sampleSiteService.getSampleSitesForSurveyId(surveyId, {});
    const surveySamplingSitesGeometry = await sampleSiteService.getSampleSitesGeometryBySurveyId(surveyId);
    const surveySamplingPeriods = await samplePeriodService.getSamplePeriodsForSurvey(surveyId, {});
    const surveySamplingTechniques = await sampleTechniqueService.getSamplingTechniquesForSurvey(surveyId);

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
    const surveyHabitatFeatures = await habitatFeatureService.getSurveyHabitatFeatures(surveyId);

    // Get telemetry data for survey
    const surveyTelemetryDevices = await telemetryDeviceService.getDevicesForSurvey(surveyId);
    const surveyTelemetryDeployments = await telemetryDeploymentService.getDeploymentsForSurvey(surveyId);

    // Get telemetry data points for deployments
    const deploymentIds = surveyTelemetryDeployments.map((deployment) => deployment.deployment_id);
    const surveyTelemetry =
      deploymentIds.length > 0 ? await telemetryVendorService.getTelemetryForDeployments(surveyId, deploymentIds) : [];

    // Get all codeset categories for BioHub submission
    const codesetCategories = await codeService.getAllCodesetCategories();

    // Get survey animals from Critterbase (via SIMS survey-critter associations)
    const surveyAnimals = await surveyCritterService.getCritterbaseSurveyCritters(surveyId);

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
        strata: siteSelectionData.stratums,
        siteSelectionStrategies: siteSelectionData.strategies,
        codesetCategories
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
          // Add child ID to current block's content
          flatBlock.content.push(childBlock.id);
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
   * @param {string} datasetId - The dataset ID
   * @param {Map<string, IFlattenedBlock[]>} blocksByType - Map of block types to their flattened blocks
   * @param {string} tarFilePath - Full path where the TAR file should be created
   * @return {*}  {Promise<void>}
   * @memberof PlatformService
   */
  async _createTarArchive(
    datasetId: string,
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

    // Add the dataset directory entry
    pack.entry(
      {
        name: `${datasetId}/`,
        type: 'directory'
      },
      undefined,
      (dirErr?: Error | null) => {
        if (dirErr) {
          pack.destroy();
          throw dirErr;
        }
        this._addMetadataFile(pack, datasetId, blocksByType);
      }
    );

    await streamPromise;
  }

  /**
   * Adds metadata file and JSON files to the TAR archive.
   *
   * @param {tarStream.Pack} pack - The TAR pack stream
   * @param {string} datasetId - The dataset ID
   * @param {Map<string, IFlattenedBlock[]>} blocksByType - Map of block types to their flattened blocks
   * @memberof PlatformService
   */
  _addMetadataFile(pack: tarStream.Pack, datasetId: string, blocksByType: Map<string, IFlattenedBlock[]>): void {
    // Add a metadata file with the dataset ID
    // Note: tar-stream doesn't easily support PAX extended attributes,
    // so we store the dataset ID in a metadata file instead
    const metadataContent = Buffer.from(datasetId);
    pack.entry(
      {
        name: `${datasetId}/.dataset-id`,
        size: metadataContent.length
      },
      metadataContent,
      (metadataErr?: Error | null) => {
        if (metadataErr) {
          pack.destroy();
          throw metadataErr;
        }
        // Start adding JSON files and file blocks (async operation)
        this._addJsonFiles(pack, datasetId, blocksByType).catch((error) => {
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
   * Adds all JSON files from the blocksByType Map to the TAR archive.
   * Also includes actual file content for blocks with type 'file'.
   *
   * @param {tarStream.Pack} pack - The TAR pack stream
   * @param {string} datasetId - The dataset ID
   * @param {Map<string, IFlattenedBlock[]>} blocksByType - Map of block types to their flattened blocks
   * @memberof PlatformService
   */
  async _addJsonFiles(
    pack: tarStream.Pack,
    datasetId: string,
    blocksByType: Map<string, IFlattenedBlock[]>
  ): Promise<void> {
    if (blocksByType.size === 0) {
      pack.finalize();
      return;
    }

    const fileBlocks = blocksByType.get('file') || [];
    let jsonFilesProcessed = 0;
    const totalJsonFiles = blocksByType.size;
    let fileBlocksProcessed = 0;
    const totalFileBlocks = fileBlocks.length;

    const checkAndFinalize = () => {
      if (jsonFilesProcessed === totalJsonFiles && fileBlocksProcessed === totalFileBlocks) {
        pack.finalize();
      }
    };

    this._addJsonFilesToArchive(pack, datasetId, blocksByType, () => {
      jsonFilesProcessed++;
      checkAndFinalize();
    });

    await this._addFileBlocksToArchive(pack, datasetId, fileBlocks, () => {
      fileBlocksProcessed++;
      checkAndFinalize();
    });
  }

  /**
   * Adds JSON files for all block types to the TAR archive.
   *
   * @param {tarStream.Pack} pack - The TAR pack stream
   * @param {string} datasetId - The dataset ID
   * @param {Map<string, IFlattenedBlock[]>} blocksByType - Map of block types to their flattened blocks
   * @param {() => void} onComplete - Callback when JSON file is added
   * @memberof PlatformService
   */
  _addJsonFilesToArchive(
    pack: tarStream.Pack,
    datasetId: string,
    blocksByType: Map<string, IFlattenedBlock[]>,
    onComplete: () => void
  ): void {
    blocksByType.forEach((blocks, type) => {
      const fileName = `${type}.json`;
      const fileContent = Buffer.from(JSON.stringify(blocks, null, 2));
      this._addFileToArchive(pack, datasetId, fileName, fileContent, onComplete);
    });
  }

  /**
   * Adds actual file content for file type blocks to the TAR archive.
   *
   * @param {tarStream.Pack} pack - The TAR pack stream
   * @param {string} datasetId - The dataset ID
   * @param {IFlattenedBlock[]} fileBlocks - Array of file blocks to process
   * @param {() => void} onComplete - Callback when file block is processed
   * @memberof PlatformService
   */
  async _addFileBlocksToArchive(
    pack: tarStream.Pack,
    datasetId: string,
    fileBlocks: IFlattenedBlock[],
    onComplete: () => void
  ): Promise<void> {
    if (fileBlocks.length === 0) {
      return;
    }

    for (const fileBlock of fileBlocks) {
      await this._processFileBlock(pack, datasetId, fileBlock, onComplete);
    }
  }

  /**
   * Processes a single file block by downloading from S3 and adding to archive.
   *
   * @param {tarStream.Pack} pack - The TAR pack stream
   * @param {string} datasetId - The dataset ID
   * @param {IFlattenedBlock} fileBlock - The file block to process
   * @param {() => void} onComplete - Callback when file is processed
   * @memberof PlatformService
   */
  async _processFileBlock(
    pack: tarStream.Pack,
    datasetId: string,
    fileBlock: IFlattenedBlock,
    onComplete: () => void
  ): Promise<void> {
    try {
      const artifactKey = fileBlock.properties?.artifact_key as string | undefined;
      const filename = (fileBlock.properties?.filename as string | undefined) || fileBlock.id;

      if (!artifactKey) {
        this._logFileBlockWarning('File block missing artifact_key, skipping', fileBlock.id);
        onComplete();
        return;
      }

      const fileContent = await this._downloadFileFromS3(artifactKey, fileBlock.id);
      if (!fileContent) {
        onComplete();
        return;
      }

      const archivePath = `files/${filename}`;
      this._addFileToArchive(pack, datasetId, archivePath, fileContent, onComplete);
    } catch (error) {
      this._logFileBlockError('Failed to add file block to archive', fileBlock.id, error);
      onComplete();
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
   * @param {string} datasetId - The dataset ID
   * @param {string} fileName - Filename to add
   * @param {Buffer} fileContent - File content as a Buffer
   * @param {() => void} onComplete - Callback when file is added
   * @memberof PlatformService
   */
  _addFileToArchive(
    pack: tarStream.Pack,
    datasetId: string,
    fileName: string,
    fileContent: Buffer,
    onComplete: () => void
  ): void {
    pack.entry(
      {
        name: `${datasetId}/${fileName}`,
        size: fileContent.length
      },
      fileContent,
      (entryErr?: Error | null) => {
        if (entryErr) {
          pack.destroy();
          throw entryErr;
        }
        onComplete();
      }
    );
  }

  /**
   * Initiates a multipart upload to BioHub and gets presigned URLs for S3.
   *
   * @param {string} token - Keycloak service token
   * @param {number} tarFileSize - Size of the TAR file in bytes
   * @param {PostSurveySubmissionToBioHubObject} surveyDataPackage - Survey data package
   * @param {string} submissionComment - Comment for the submission
   * @return {*}  {Promise<{uploadId: string, s3UploadId: string, key: string, presignedUrls: Array<{partNumber: number, url: string}>, partCount: number, submissionId: number}>}
   * @memberof PlatformService
   */
  async _initiateSubmissionUpload(
    token: string,
    tarFileSize: number,
    surveyDataPackage: PostSurveySubmissionToBioHubObject,
    submissionComment: string
  ): Promise<{
    uploadId: string;
    s3UploadId: string;
    key: string;
    presignedUrls: Array<{ partNumber: number; url: string }>;
    partCount: number;
    submissionId: number;
  }> {
    defaultLog.debug({ label: '_initiateSubmissionUpload', tarFileSize });

    // Validate file size
    const SUBMISSION_UPLOAD_MAX_SIZE = getEnvironmentVariable('SUBMISSION_UPLOAD_MAX_SIZE');
    if (tarFileSize > SUBMISSION_UPLOAD_MAX_SIZE) {
      throw new ApiError(
        ApiErrorType.UNKNOWN,
        `TAR file size (${tarFileSize} bytes) exceeds maximum allowed size (${SUBMISSION_UPLOAD_MAX_SIZE} bytes)`
      );
    }

    // Create submission upload URL
    const backboneSubmissionUploadUrl = new URL(getBackboneSubmissionUploadPath(), getBackboneInternalApiHost()).href;

    // Prepare request body
    const requestBody = {
      bytes: tarFileSize,
      name: surveyDataPackage.name,
      description: surveyDataPackage.description,
      comment: submissionComment
    };

    try {
      const response = await axios.post<{
        submissionId: number;
        uploadId: string;
        s3UploadId: string;
        uploadArchiveId: string;
        key: string;
        partSizeBytes: number;
        partCount: number;
        presignedUrls: Array<{ partNumber: number; url: string }>;
      }>(backboneSubmissionUploadUrl, requestBody, {
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      defaultLog.info({
        label: '_initiateSubmissionUpload',
        message: 'Received presigned URLs',
        submissionId: response.data.submissionId,
        uploadId: response.data.uploadId,
        partCount: response.data.partCount
      });

      return {
        uploadId: response.data.uploadId,
        s3UploadId: response.data.s3UploadId,
        key: response.data.key,
        presignedUrls: response.data.presignedUrls,
        partCount: response.data.partCount,
        submissionId: response.data.submissionId
      };
    } catch (error) {
      defaultLog.error({
        label: '_initiateSubmissionUpload',
        message: 'Failed to initiate submission upload',
        error: formatAxiosError(error)
      });
      throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to initiate submission upload to BioHub');
    }
  }

  /**
   * Splits a file buffer into chunks for multipart upload.
   *
   * @param {Buffer} fileBuffer - The file buffer to split
   * @param {number} numChunks - Number of chunks to create
   * @return {*}  {Buffer[]} Array of buffer chunks
   * @memberof PlatformService
   */
  _splitFileIntoChunks(fileBuffer: Buffer, numChunks: number): Buffer[] {
    if (numChunks === 1) {
      return [fileBuffer];
    }

    const chunkSize = Math.ceil(fileBuffer.length / numChunks);
    const chunks: Buffer[] = [];

    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileBuffer.length);
      chunks.push(fileBuffer.slice(start, end));
    }

    return chunks;
  }

  /**
   * Uploads a single chunk to S3 using a presigned URL.
   *
   * @param {string} presignedUrl - The presigned S3 URL
   * @param {Buffer} chunk - The chunk data to upload
   * @param {number} partNumber - The part number (1-indexed)
   * @return {*}  {Promise<{PartNumber: number, ETag: string}>}
   * @memberof PlatformService
   */
  async _uploadChunkToS3(
    presignedUrl: string,
    chunk: Buffer,
    partNumber: number
  ): Promise<{ PartNumber: number; ETag: string }> {
    try {
      const response = await axios.put(presignedUrl, chunk, {
        headers: {
          'Content-Type': 'application/x-tar'
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      // Get ETag from response headers (case-insensitive)
      const etag = response.headers.etag || response.headers.ETag;
      if (!etag) {
        throw new Error(`No ETag returned from S3 upload for part ${partNumber}`);
      }

      // Remove quotes from ETag
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
   * @param {string} tarFilePath - Path to the TAR file
   * @param {Array<{partNumber: number, url: string}>} presignedUrls - Array of presigned URLs
   * @param {number} partCount - Total number of parts
   * @return {*}  {Promise<Array<{PartNumber: number, ETag: string}>>} Array of uploaded parts with ETags
   * @memberof PlatformService
   */
  async _uploadTarFileParts(
    tarFilePath: string,
    presignedUrls: Array<{ partNumber: number; url: string }>,
    partCount: number
  ): Promise<Array<{ PartNumber: number; ETag: string }>> {
    defaultLog.debug({ label: '_uploadTarFileParts', tarFilePath, partCount });

    // Read TAR file as Buffer
    const fileBuffer = fs.readFileSync(tarFilePath);

    // Split into chunks
    const chunks = this._splitFileIntoChunks(fileBuffer, partCount);

    // Upload with concurrency limit (4 parallel uploads)
    const concurrencyLimit = 4;
    const parts: Array<{ PartNumber: number; ETag: string }> = [];

    for (let i = 0; i < presignedUrls.length; i += concurrencyLimit) {
      const batch = presignedUrls.slice(i, i + concurrencyLimit);
      const chunkBatch = chunks.slice(i, i + concurrencyLimit);

      defaultLog.debug({
        label: '_uploadTarFileParts',
        message: 'Uploading batch',
        batchStart: i,
        batchSize: batch.length
      });

      const batchResults = await Promise.all(
        batch.map((urlObj, idx) => this._uploadChunkToS3(urlObj.url, chunkBatch[idx], urlObj.partNumber))
      );

      parts.push(...batchResults);
    }

    // Sort parts by PartNumber
    parts.sort((a, b) => a.PartNumber - b.PartNumber);

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
   * @param {Array<{PartNumber: number, ETag: string}>} parts - Array of uploaded parts with ETags
   * @return {*}  {Promise<void>}
   * @memberof PlatformService
   */
  async _completeSubmissionUpload(
    token: string,
    uploadId: string,
    s3UploadId: string,
    key: string,
    parts: Array<{ PartNumber: number; ETag: string }>
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
}
