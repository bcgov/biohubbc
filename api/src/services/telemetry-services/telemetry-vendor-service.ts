import { TelemetryManualRecord } from '../../database-models/telemetry_manual';
import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { TelemetryManualRepository } from '../../repositories/telemetry-repositories/telemetry-manual-repository';
import { CreateManualTelemetry } from '../../repositories/telemetry-repositories/telemetry-manual-repository.interface';
import { TelemetryVendorRepository } from '../../repositories/telemetry-repositories/telemetry-vendor-repository';
import {
  Telemetry,
  TelemetryOptions
} from '../../repositories/telemetry-repositories/telemetry-vendor-repository.interface';
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
    const deploymentIds = deployments.map((deployment) => deployment.deployment2_id);

    return this.vendorRepository.getTelemetryByDeploymentIds(surveyId, deploymentIds, options);
  }

  /**
   * Get paginated telemetry data for a survey.
   *
   * @async
   * @param {number} surveyId
   * @param {TelemetryOptions} [options] - Telemetry options
   * @returns {Promise<[Telemetry[], number]>} Tuple of telemetry data and total count
   */
  async getTelemetryForSurvey(surveyId: number, options?: TelemetryOptions): Promise<[Telemetry[], number]> {
    const deployments = await this.deploymentService.getDeploymentsForSurveyId(surveyId);
    const deploymentIds = deployments.map((deployment) => deployment.deployment2_id);

    if (!options) {
      const telemetry = await this.vendorRepository.getTelemetryByDeploymentIds(surveyId, deploymentIds);
      return [telemetry, telemetry.length];
    }

    return Promise.all([
      this.vendorRepository.getTelemetryByDeploymentIds(surveyId, deploymentIds, options),
      this.vendorRepository.getTelemetryCountByDeploymentIds(surveyId, deploymentIds)
    ]);
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
    const deploymentIds = [...new Set(telemetry.map((record) => record.deployment2_id))];
    const deployments = await this.deploymentService.getDeploymentsByIds(surveyId, deploymentIds);

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
}
