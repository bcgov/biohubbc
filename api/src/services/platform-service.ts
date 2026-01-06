import axios from 'axios';
import FormData from 'form-data';
import { Feature, FeatureCollection } from 'geojson';
import mime from 'mime';
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
const getBackboneArtifactIntakePath = () => getEnvironmentVariable('BACKBONE_ARTIFACT_INTAKE_PATH');
const getBackboneSurveyIntakePath = () => getEnvironmentVariable('BACKBONE_INTAKE_PATH');
const getBackboneTaxonTsnPath = () => getEnvironmentVariable('BIOHUB_TAXON_TSN_PATH');
const getBackboneTaxonPath = () => getEnvironmentVariable('BIOHUB_TAXON_PATH');

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

    // Flatten and save the survey data package grouped by type
    try {
      const flattenedData = this._flattenToBlockModel(surveyDataPackage);

      // Find the dataset ID (root block with type "dataset")
      const datasetBlock = flattenedData.find((block) => block.type === 'dataset' && block.parent === null);
      const datasetId = datasetBlock?.id || 'unknown';

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
      // Data is added directly from memory, skipping disk write/read cycle
      const submissionsBaseDir = path.join(process.cwd(), 'data', 'submissions');
      fs.mkdirSync(submissionsBaseDir, { recursive: true });
      const tarFilePath = path.join(submissionsBaseDir, `${datasetId}.tar`);
      await this._createTarArchive(datasetId, blocksByType, tarFilePath);

      // TODO: Remove the TAR file after it's no longer needed for debugging
      defaultLog.info({
        label: 'submitSurveyToBioHub',
        message: 'Flattened survey data package saved by type and compressed to TAR',
        totalBlocks: flattenedData.length,
        totalTypes: blocksByType.size,
        tarFilePath
      });
    } catch (flattenError) {
      defaultLog.warn({
        label: 'submitSurveyToBioHub',
        message: 'Failed to save flattened survey data package for debugging',
        error: flattenError instanceof Error ? flattenError.message : 'Unknown error'
      });
    }

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

    // Get observation signs for mapping IDs to names
    const allCodes = await codeService.getAllCodeSets();
    const observationSigns = allCodes.observation_signs;

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
    // Transform code types to habitat feature type records
    const habitatFeatureTypes = allCodes.habitat_feature_types.map((type) => ({
      habitat_feature_type_id: type.id,
      name: type.name,
      description: type.description,
      record_end_date: null
    }));

    // Get telemetry data for survey
    const surveyTelemetryDevices = await telemetryDeviceService.getDevicesForSurvey(surveyId);
    const surveyTelemetryDeployments = await telemetryDeploymentService.getDeploymentsForSurvey(surveyId);

    // Get telemetry data points for deployments
    const deploymentIds = surveyTelemetryDeployments.map((deployment) => deployment.deployment_id);
    const surveyTelemetry =
      deploymentIds.length > 0 ? await telemetryVendorService.getTelemetryForDeployments(surveyId, deploymentIds) : [];

    const deviceMakes = allCodes.telemetry_device_makes;
    const frequencyUnits = allCodes.frequency_units;

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
        observationSigns,
        environmentDefinitions,
        measurementDefinitions,
        samplingSites: surveysamplingSites,
        samplingPeriods: surveySamplingPeriods,
        samplingTechniques: surveySamplingTechniques,
        habitatFeatures: surveyHabitatFeatures,
        habitatFeatureTypes,
        telemetryDevices: surveyTelemetryDevices,
        telemetryDeployments: surveyTelemetryDeployments,
        telemetry: surveyTelemetry,
        deviceMakes,
        frequencyUnits,
        partnerships,
        focalSpecies,
        surveyLocation,
        firstNations: allCodes.first_nations,
        strata: siteSelectionData.stratums,
        siteSelectionStrategies: siteSelectionData.strategies
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

    const { data } = await axios.post<{ artifact_uuid: string }>(backboneArtifactIntakeUrl, formData, {
      headers: {
        authorization: `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    return data;
  }
}
