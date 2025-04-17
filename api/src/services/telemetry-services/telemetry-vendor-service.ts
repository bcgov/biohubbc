import { chunk } from 'lodash';
import { TelemetryManualRecord } from '../../database-models/telemetry_manual';
import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { IAllTelemetryAdvancedFilters } from '../../models/telemetry-view';
import { TelemetryManualRepository } from '../../repositories/telemetry-repositories/telemetry-manual-repository';
import { CreateManualTelemetry } from '../../repositories/telemetry-repositories/telemetry-manual-repository.interface';
import { TelemetryVendorRepository } from '../../repositories/telemetry-repositories/telemetry-vendor-repository';
import {
  Telemetry,
  TelemetryFilters,
  TelemetryOptions,
  TelemetrySpatial,
  TelemetrySupplementary
} from '../../repositories/telemetry-repositories/telemetry-vendor-repository.interface';
import { taskQueue } from '../../utils/task-queue';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { DBService } from '../db-service';
import { TelemetryDeploymentService } from './telemetry-deployment-service';

/**
 * A service class for working with telemetry vendor data.
 *
 * @export
 * @class TelemetryVendorService
 * @extends {DBService}
 */
export class TelemetryVendorService extends DBService {
  vendorRepository: TelemetryVendorRepository;
  manualRepository: TelemetryManualRepository;

  deploymentService: TelemetryDeploymentService;

  constructor(connection: IDBConnection) {
    super(connection);

    // Telemetry repositories
    this.vendorRepository = new TelemetryVendorRepository(connection);
    this.manualRepository = new TelemetryManualRepository(connection);

    // Services
    this.deploymentService = new TelemetryDeploymentService(connection);
  }

  /**
   * Get telemetry data for a single deployment.
   *
   * @async
   * @param {number} surveyId
   * @param {number} deploymentId
   * @param {TelemetryOptions} [options] - Telemetry options
   * @returns {Promise<Telemetry[]>}
   */
  async getTelemetryForDeployment(
    surveyId: number,
    deploymentId: number,
    options?: TelemetryOptions
  ): Promise<Telemetry[]> {
    return this.vendorRepository.getTelemetryByDeploymentIds(surveyId, [deploymentId], options);
  }

  /**
   * Get telemetry data for a list of deployments.
   *
   * @async
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @param {TelemetryOptions} [options] - Telemetry options
   * @returns {Promise<Telemetry[]>}
   */
  async getTelemetryForDeployments(
    surveyId: number,
    deploymentIds: number[],
    options?: TelemetryOptions
  ): Promise<Telemetry[]> {
    return this.vendorRepository.getTelemetryByDeploymentIds(surveyId, deploymentIds, options);
  }

  /**
   * Get telemetry data for a critter.
   *
   * @async
   * @param {number} surveyId
   * @param {number} critterId
   * @param {TelemetryOptions} [options] - Telemetry options
   * @returns {Promise<Telemetry[]>}
   */
  async getTelemetryForCritter(surveyId: number, critterId: number, options?: TelemetryOptions): Promise<Telemetry[]> {
    const deployments = await this.deploymentService.getDeploymentsForCritterId(surveyId, critterId);
    const deploymentIds = deployments.map((deployment) => deployment.deployment_id);

    return this.vendorRepository.getTelemetryByDeploymentIds(surveyId, deploymentIds, options);
  }
  /**
   * Get paginated telemetry data for a survey.
   *
   * @param {number} surveyId
   * @param {TelemetryOptions} [options] - Telemetry query options
   * @returns {Promise<[Telemetry[], TelemetrySupplementary]>} Tuple of telemetry data and supplementary info
   */
  async getTelemetryForSurvey(
    surveyId: number,
    options?: TelemetryOptions
  ): Promise<[Telemetry[], TelemetrySupplementary]> {
    const deployments = await this.deploymentService.getDeploymentsForSurvey(surveyId);
    if (!deployments.length) {
      return [[], { count: 0, start_date: null, end_date: null }];
    }

    const deploymentIds = deployments.map((d) => d.deployment_id);
    const telemetry = await this.vendorRepository.getTelemetryByDeploymentIds(surveyId, deploymentIds, options);
    const supplementary = await this.vendorRepository.getTelemetrySupplementaryByDeploymentIds(surveyId, deploymentIds);

    return [telemetry, supplementary];
  }

  /**
   * Get telemetry spatial data for a survey.
   *
   * @async
   * @param {number} surveyId
   * @param {TelemetryFilters} filters
   * @return {Promise<[TelemetrySpatial[], TelemetrySupplementary]>} - A tuple containing the telemetry spatial data and supplementary information
   */
  async getTelemetrySpatialForSurvey(
    surveyId: number,
    filters: TelemetryFilters
  ): Promise<[TelemetrySpatial[], TelemetrySupplementary]> {
    const deployments = await this.deploymentService.getDeploymentsForSurvey(surveyId);
    const deploymentIds = deployments.map((deployment) => deployment.deployment_id);

    const telemetry = await this.vendorRepository.getTelemetrySpatialByDeploymentIds(surveyId, deploymentIds, filters);
    const supplementary = await this.vendorRepository.getTelemetrySupplementaryByDeploymentIds(surveyId, deploymentIds);
    return [telemetry, supplementary];
  }

  /**
   * Get a specific telemetry record
   *
   * @param {number} surveyId
   * @param {string} telemetryId
   * @returns {Promise<Telemetry>}
   */
  async getTelemetryRecordById(surveyId: number, telemetryId: string): Promise<Telemetry> {
    return this.vendorRepository.getTelemetryRecordById(surveyId, telemetryId);
  }

  /**
   * Retrieves the paginated list of all telemetry records that are available to the user, based on their permissions
   * and provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IAllTelemetryAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<Telemetry[]>}
   * @memberof TelemetryVendorService
   */
  async findTelemetry(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IAllTelemetryAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<Telemetry[]> {
    return this.vendorRepository.findTelemetry(isUserAdmin, systemUserId, filterFields, pagination);
  }

  /**
   * Retrieves the count of all telemetry records that are available to the user, based on their permissions and
   * provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IAllTelemetryAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof TelemetryVendorService
   */
  async findTelemetryCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IAllTelemetryAdvancedFilters
  ): Promise<number> {
    return this.vendorRepository.findTelemetryCount(isUserAdmin, systemUserId, filterFields);
  }

  /**
   * Create manual telemetry records.
   *
   * @async
   * @param {number} surveyId
   * @param {CreateManualTelemetry[]} telemetry - List of manual telemetry data to create
   * @returns {Promise<void>}
   */
  async bulkCreateManualTelemetry(surveyId: number, telemetry: CreateManualTelemetry[]): Promise<void> {
    const deploymentIds = [...new Set(telemetry.map((record) => record.deployment_id))];
    const deployments = await this.deploymentService.getDeploymentsForSurvey(surveyId, deploymentIds);

    if (deployments.length !== deploymentIds.length) {
      throw new ApiGeneralError('Failed to create manual telemetry', [
        'TelemetryVendorService->bulkCreateManualTelemetry',
        'survey missing reference to one or more deployment IDs'
      ]);
    }

    return this.manualRepository.bulkCreateManualTelemetry(telemetry);
  }

  /**
   * Update manual telemetry records.
   *
   * Note: Since this is a bulk update request, the payload must include all the properties to PUT.
   *
   * @async
   * @param {number} surveyId
   * @param {TelemetryManualRecord[]} telemetry - List of manual telemetry data to update
   * @returns {Promise<void>}
   */
  async bulkUpdateManualTelemetry(surveyId: number, telemetry: TelemetryManualRecord[]): Promise<void> {
    const telemetryManualIds = telemetry.map((record) => record.telemetry_manual_id);
    const manualTelemetry = await this.manualRepository.getManualTelemetryByIds(surveyId, telemetryManualIds);

    if (manualTelemetry.length !== telemetry.length) {
      throw new ApiGeneralError('Failed to update manual telemetry', [
        'TelemetryVendorService->bulkUpdateManualTelemetry',
        'survey missing reference to one or more telemetry manual IDs'
      ]);
    }

    return this.manualRepository.bulkUpdateManualTelemetry(telemetry);
  }

  /**
   * Delete manual telemetry records.
   *
   * @async
   * @param {number} surveyId
   * @param {string[]} telemetryManualIds - List of manual telemetry IDs
   * @returns {Promise<void>}
   */
  async bulkDeleteManualTelemetry(surveyId: number, telemetryManualIds: string[]): Promise<void> {
    const manualTelemetry = await this.manualRepository.getManualTelemetryByIds(surveyId, telemetryManualIds);

    if (manualTelemetry.length !== telemetryManualIds.length) {
      throw new ApiGeneralError('Failed to delete manual telemetry', [
        'TelemetryVendorService->bulkDeleteManualTelemetry',
        'survey missing reference to one or more telemetry manual IDs'
      ]);
    }

    return this.manualRepository.bulkDeleteManualTelemetry(telemetryManualIds);
  }

  /**
   * Bulk create a telemetry in batches.
   * Note: This is to prevent SQL maximum query size error.
   *
   * @async
   * @param {number} surveyId - The survey ID
   * @param {CreateManualTelemetry[]} telemetry - The telemetry to create
   * @returns {*} {Promise<void>}
   */
  async bulkCreateTelemetryInBatches(surveyId: number, telemetry: CreateManualTelemetry[]): Promise<void> {
    // Max telemetry records to insert in a single query
    const TELEMETRY_BATCH_SIZE = 500;
    // Max concurrent queries
    const CONCURRENT_QUERIES = 10;

    // Split the teletry into batches to prevent SQL cap error
    const telemetryBatches = chunk(telemetry, TELEMETRY_BATCH_SIZE);

    // Create the async task processor
    const telemetryProcessor = async (telemetryBatch: CreateManualTelemetry[]): Promise<void> => {
      return this.bulkCreateManualTelemetry(surveyId, telemetryBatch);
    };

    // Process the telemetry in batches
    const queueResult = await taskQueue(telemetryBatches, telemetryProcessor, CONCURRENT_QUERIES);

    // Check for any errors in the batch processing
    const batchErrors = queueResult.filter((result) => result.error);
    if (batchErrors.length) {
      throw new ApiGeneralError('Failed to bulk create manual telemetry', [batchErrors.map((task) => task.error)]);
    }
  }
}
