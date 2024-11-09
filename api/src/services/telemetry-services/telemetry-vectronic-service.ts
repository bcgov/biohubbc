import axios from 'axios';
import { chunk } from 'lodash';
import { TelemetryCredentialVectronicRecord } from '../../database-models/telemetry_credential_vectronic';
import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { TelemetryVectronicRepository } from '../../repositories/telemetry-repositories/telemetry-vectronic-repository';
import {
  VectronicAPIQuery,
  VectronicPayload,
  VectronicTask
} from '../../repositories/telemetry-repositories/telemetry-vectronic-repository.interface';
import { getLogger } from '../../utils/logger';
import { QueueResult, taskQueue } from '../../utils/task-queue';
import { DBService } from '../db-service';
import { keysToLowerCase } from './telemetry-utils';
import { TelemetryProcessingOptions, TelemetryProcessingResult } from './telemetry.interface';
const defaultLog = getLogger('TelemetryVectronicService');

/**
 * This service is responsible for fetching telemetry data from the Vectronic API and storing it in SIMS.
 *
 * @see https://api.vectronic-wildlife.com/swagger-ui/index.html?configUrl=/v3/api-docs/swagger-config
 *
 * @export
 * @class TelemetryVendorService
 * @extends {DBService}
 */
export class TelemetryVectronicService extends DBService {
  telemetryVectronicRepository: TelemetryVectronicRepository;

  /**
   * Creates an instance of TelemetryVectronicService.
   *
   * @param {IDBConnection} connection
   */
  constructor(connection: IDBConnection) {
    super(connection);
    this.telemetryVectronicRepository = new TelemetryVectronicRepository(connection);
  }

  /**
   * Get the base URL for the Vectronic API.
   *
   * @returns {*} {URL}
   */
  getVectronicBaseURL(): URL {
    return new URL(process.env.VECTRONIC_API_HOST ?? 'https://api.vectronic-wildlife.com');
  }

  /**
   * Get the URL for fetching Vectronic telemetry data for a specific device.
   *
   * @param {VectronicAPIQuery} query - Vectronic API request query
   * @returns {*} {URL}
   */
  getVectronicTelemetryURL(query: VectronicAPIQuery): URL {
    const url = this.getVectronicBaseURL();

    url.searchParams.append('collarkey', query.collarkey);

    if (query.beforeAcquisition) {
      url.searchParams.append('beforeAcquisition', query.beforeAcquisition);
    }

    if (query.afterAcquisition) {
      url.searchParams.append('afterAcquisition', query.afterAcquisition);
    }

    if (query.gtId) {
      url.searchParams.append('gt-id', String(query.gtId));
    }

    return url;
  }

  /**
   * Fetch vectronic device telemetry data from the Vectronic API.
   *
   * @param {VectronicAPIQuery} query - Vectronic API request query
   * @returns {Promise<VectronicPayload>}
   */
  async fetchTelemetryFromVectronic(query: VectronicAPIQuery): Promise<VectronicPayload[]> {
    const url = this.getVectronicTelemetryURL(query);
    url.pathname = `v2/collar/${query.idcollar}/gps`;

    try {
      // Note: Vectronic is using SentenceCased keys in their API response
      const response = await axios.get<VectronicPayload[]>(url.toString());

      return response.data.map((record) => keysToLowerCase(record));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        defaultLog.error({ label: 'fetchTelemetryFromVectronic', message: 'error', error: error.message });
      }

      throw new ApiGeneralError('Failed to fetch devices from Vectronic.');
    }
  }

  /**
   * Fetch vectronic device telemetry count from the Vectronic API.
   *
   * @param {VectronicAPIQuery} query - Vectronic API request query
   * @returns {*} {Promise<number>}
   */
  async fetchTelemetryCountFromVectronic(query: VectronicAPIQuery): Promise<number> {
    const url = this.getVectronicTelemetryURL(query);
    url.pathname = `v2/collar/${query.idcollar}/gps/count`;

    try {
      const response = await axios.get(url.toString());

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        defaultLog.error({ label: 'fetchTelemetryCountFromVectronic', message: 'error', error: error.message });
      }

      throw new ApiGeneralError('Failed to fetch device count from Vectronic.');
    }
  }

  /**
   * Get all Vectronic credentials from SIMS.
   *
   * @returns {*} {Promise<TelemetryCredentialVectronicRecord[]>}
   */
  async getDeviceCredentials(): Promise<TelemetryCredentialVectronicRecord[]> {
    return this.telemetryVectronicRepository.getAllVectronicCredentials();
  }

  /**
   * Create Vectronic telemetry records in SIMS in batches.
   *
   * @param {VectronicPayload} telemetry - Vectronic telemetry records
   * @returns {Promise<number>}
   */
  async batchCreateTelemetry(telemetry: VectronicPayload[], batchSize = 1000): Promise<number> {
    const telemetryBatches = chunk(telemetry, batchSize);

    // Insert telemetry data in batches
    const rowCounts = await Promise.all(
      telemetryBatches.map((batch) => this.telemetryVectronicRepository.createVectronicTelemetry(batch))
    );

    // Return the total number of inserted rows
    return rowCounts.reduce((acc, count) => acc + count, 0);
  }

  /**
   * Get a map of device serials to their telemetry activity statistics.
   *
   * @returns {*} {Promise<Map<number, { telemetryCount: number, maxIdposition: number | null}>} The device activity map
   */
  async getDevicesActivitiesMap(): Promise<Map<number, { telemetryCount: number; maxIdposition: number | null }>> {
    const deviceActivityStats = await this.telemetryVectronicRepository.getDeviceActivityStatistics();
    return new Map(
      deviceActivityStats.map((value) => [
        value.serial,
        { telemetryCount: value.telemetry_count, maxIdposition: value.max_idposition }
      ])
    );
  }

  /**
   * Process (fetch and insert) telemetry data for a list of Vectronic tasks.
   *
   * @param {VectronicTask[]} tasks - List of Vectronic tasks
   * @param {TelemetryProcessingOptions} options - Telemetry processing options
   * @returns {*} {Promise<QueueResult<VectronicTask, TelemetryProcessingResult>[]>}
   */
  async processTelemetry(
    tasks: VectronicTask[],
    options: TelemetryProcessingOptions
  ): Promise<QueueResult<VectronicTask, TelemetryProcessingResult>[]> {
    const activityMap = await this.getDevicesActivitiesMap();

    return taskQueue(
      tasks,
      async (task: VectronicTask) => {
        // Track the telemetry processing state
        const telemetry = { total: 0, new: 0, created: 0 };

        // Fetch the total number of device telemetry records from Vectronic API
        telemetry.total = await this.fetchTelemetryCountFromVectronic({
          idcollar: task.serial,
          collarkey: task.key
        });

        // Get the device activity statistics from SIMS
        const deviceActivity = activityMap.get(task.serial) ?? { telemetryCount: 0, maxIdposition: null };

        // Calculate the number of new telemetry records ie: telemetry records that are not in SIMS
        telemetry.new = telemetry.total - deviceActivity.telemetryCount;

        if (telemetry.new) {
          // Fetch telemetry data from Vectronic API
          const vectronicTelemetry = await this.fetchTelemetryFromVectronic({
            idcollar: task.serial,
            collarkey: task.key,
            afterAcquisition: options.startDate,
            beforeAcquisition: options.endDate,
            // If no start date provided, use the largest idposition from SIMS
            gtId: options.startDate ? undefined : deviceActivity.maxIdposition ?? undefined
          });

          // Batch insert telemetry data into SIMS
          telemetry.created = await this.batchCreateTelemetry(vectronicTelemetry, options.batchSize);
        }

        defaultLog.info({ label: 'processTelemetry', ...telemetry });
        return { new: telemetry.new, created: telemetry.created };
      },
      options.concurrently
    );
  }
}
