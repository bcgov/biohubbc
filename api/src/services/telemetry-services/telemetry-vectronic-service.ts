import axios, { AxiosInstance } from 'axios';
import { chunk } from 'lodash';
import qs from 'qs';
import { TelemetryCredentialVectronicRecord } from '../../database-models/telemetry_credential_vectronic';
import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { formatAxiosError } from '../../errors/axios-error';
import { TelemetryVectronicRepository } from '../../repositories/telemetry-repositories/telemetry-vectronic-repository';
import {
  VectronicAPIQuery,
  VectronicPayload,
  VectronicTask
} from '../../repositories/telemetry-repositories/telemetry-vectronic-repository.interface';
import { getEnvironmentVariable } from '../../utils/env-config';
import { getLogger } from '../../utils/logger';
import { QueueResult, taskQueue } from '../../utils/task-queue';
import { DBService } from '../db-service';
import { keysToLowerCase } from './telemetry-utils';
import { TelemetryProcessingOptions, TelemetryProcessingResult } from './telemetry.interface';
const defaultLog = getLogger('telemetry-vectronic-service');

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
  vectronicClient: AxiosInstance;

  telemetryVectronicRepository: TelemetryVectronicRepository;

  /**
   * Creates an instance of TelemetryVectronicService.
   *
   * @param {IDBConnection} connection
   */
  constructor(connection: IDBConnection) {
    super(connection);

    this.vectronicClient = axios.create({
      paramsSerializer: (params) => qs.stringify(params),
      baseURL: getEnvironmentVariable('VECTRONIC_API_HOST')
    });

    this.telemetryVectronicRepository = new TelemetryVectronicRepository(connection);
  }

  /**
   * Fetch vectronic device telemetry data from the Vectronic API.
   *
   * @param {VectronicAPIQuery} query - Vectronic API request query
   * @returns {Promise<VectronicPayload>}
   */
  async fetchTelemetryFromVectronic(query: VectronicAPIQuery): Promise<VectronicPayload[]> {
    try {
      // Note: Vectronic is using SentenceCased keys in their API response
      const response = await this.vectronicClient.get<VectronicPayload[]>(`/collar/${query.idcollar}/gps`, {
        params: {
          collarkey: query.collarkey,
          beforeAcquisition: query.beforeAcquisition,
          afterAcquisition: query.afterAcquisition,
          ['gt-id']: query.gtId
        }
      });

      return response.data.map((record) => keysToLowerCase(record));
    } catch (error) {
      throw new ApiGeneralError('Failed to fetch devices from Vectronic.', [formatAxiosError(error)]);
    }
  }

  /**
   * Fetch vectronic device telemetry count from the Vectronic API.
   *
   * @param {VectronicAPIQuery} query - Vectronic API request query
   * @returns {*} {Promise<number>}
   */
  async fetchTelemetryCountFromVectronic(query: VectronicAPIQuery): Promise<number> {
    try {
      const response = await this.vectronicClient.get(`/collar/${query.idcollar}/gps/count`, {
        params: {
          collarkey: query.collarkey,
          beforeAcquisition: query.beforeAcquisition,
          afterAcquisition: query.afterAcquisition,
          ['gt-id']: query.gtId
        }
      });

      return response.data;
    } catch (error) {
      throw new ApiGeneralError('Failed to fetch device count from Vectronic.', [formatAxiosError(error)]);
    }
  }

  /**
   * As A check test, fetch vectronic device telemetry separation count from the Vectronic API.
   *
   * @async
   * @param {string} collarId
   * @param {string} collarKey
   * @returns {Promise<number>}
   */
  async fetchTelemetrySepCountFromVectronic(collarId: string, collarKey: string): Promise<number> {
    const response = await this.vectronicClient.get(`/collar/${collarId}/sep/count`, {
      params: {
        collarkey: collarKey
      }
    });
    return response.data;
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
