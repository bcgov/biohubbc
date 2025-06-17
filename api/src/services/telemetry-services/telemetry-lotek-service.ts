import axios, { AxiosInstance } from 'axios';
import { chunk } from 'lodash';
import qs from 'qs';
import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { formatAxiosError } from '../../errors/axios-error';
import { TelemetryLotekRepository } from '../../repositories/telemetry-repositories/telemetry-lotek-repository';
import {
  LotekAPIQuery,
  LotekPayload,
  LotekTask
} from '../../repositories/telemetry-repositories/telemetry-lotek-repository.interface';
import { getEnvironmentVariable } from '../../utils/env-config';
import { getLogger } from '../../utils/logger';
import { QueueResult, taskQueue } from '../../utils/task-queue';
import { DBService } from '../db-service';
import { LotekAPIDevice } from './telemetry-lotek-service.interface';
import { getTelemetryDeviceKey, keysToLowerCase } from './telemetry-utils';
import { TelemetryProcessingOptions, TelemetryProcessingResult } from './telemetry.interface';

const defaultLog = getLogger('telemetry-lotek-service');

/**
 * This service is responsible for fetching telemetry data from the Lotek API and storing it in SIMS.
 *
 * @see https://webservice.lotek.com/API/Help
 *
 * @export
 * @class TelemetryVendorService
 * @extends {DBService}
 */
export class TelemetryLotekService extends DBService {
  lotekClient: AxiosInstance;

  token: string | undefined;

  telemetryLotekRepository: TelemetryLotekRepository;

  /**
   * Creates an instance of TelemetryLotekService.
   *
   * @param {IDBConnection} connection
   */
  constructor(connection: IDBConnection) {
    super(connection);

    this.lotekClient = axios.create({
      paramsSerializer: (params) => qs.stringify(params),
      baseURL: `${getEnvironmentVariable('LOTEK_API_HOST')}/API`
    });

    this.token = undefined;

    this.telemetryLotekRepository = new TelemetryLotekRepository(connection);
  }

  /**
   * Authenticate Lotek API account and return access token.
   *
   * @throws {ApiGeneralError} Failed to authenticate with Lotek API
   * @returns {Promise<string>} The access token
   */
  async fetchTokenFromLotek(): Promise<string> {
    // Return cached token if already authenticated
    if (this.token) {
      return this.token;
    }

    try {
      const response = await this.lotekClient.post(
        `/user/login`,
        {
          username: getEnvironmentVariable('LOTEK_ACCOUNT_USERNAME'),
          password: getEnvironmentVariable('LOTEK_ACCOUNT_PASSWORD'),
          grant_type: 'password'
        },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      // Cache token for future requests
      this.token = response.data.access_token;

      return response.data.access_token;
    } catch (error) {
      throw new ApiGeneralError('Failed to authenticate with Lotek.', [formatAxiosError(error)]);
    }
  }

  /**
   * Fetch devices associated with the authenticated Lotek API account.
   *
   * @throws {ApiGeneralError} Failed to fetch devices from Lotek API
   * @returns {Promise<LotekAPIDevice[]>} The list of devices
   */
  async fetchDevicesFromLotek(): Promise<LotekAPIDevice[]> {
    const token = await this.fetchTokenFromLotek();
    try {
      const response = await this.lotekClient.get<LotekAPIDevice[]>(`/devices`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      throw new ApiGeneralError('Failed to fetch devices from Lotek.', [formatAxiosError(error)]);
    }
  }

  /**
   * Fetch telemetry data count for a single device from Lotek API.
   *
   * @throws {ApiGeneralError} Failed to fetch device telemetry count from Lotek API
   * @param {LotekAPIQuery} query - Lotek API request query
   * @returns {Promise<number>} The number of telemetry records
   */
  async fetchTelemetryCountFromLotek(query: LotekAPIQuery): Promise<number> {
    try {
      const token = await this.fetchTokenFromLotek();
      const response = await this.lotekClient.get<string>(`/gps/count`, {
        params: {
          deviceId: query.deviceId,
          dtStart: query.dtStart,
          dtEnd: query.dtEnd
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // response.data = 'Number of Positions: 10'
      const count = response.data.replace(/\D/g, ''); // ie: '10'

      if (!count || isNaN(Number(count))) {
        throw new ApiGeneralError(`Failed to parse count from Lotek response`, [response.data]);
      }

      return Number(count);
    } catch (error) {
      throw new ApiGeneralError('Failed to fetch device telemetry count from Lotek.', [formatAxiosError(error)]);
    }
  }

  /**
   * Fetch telemetry data for a single device from Lotek API.
   *
   * @param {LotekAPIQuery} query - Lotek API request query
   * @returns {Promise<TelemetryLotekAPIRecord[]>} Raw API telemetry data
   */
  async fetchTelemetryFromLotek(query: LotekAPIQuery): Promise<LotekPayload[]> {
    try {
      const token = await this.fetchTokenFromLotek();
      // Note: Lotek is using SentenceCased keys in their API response
      const response = await this.lotekClient.get<LotekPayload[]>(`/gps`, {
        params: {
          deviceId: query.deviceId,
          dtStart: query.dtStart,
          dtEnd: query.dtEnd
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.map((record) => keysToLowerCase(record));
    } catch (error) {
      throw new ApiGeneralError('Failed to fetch device telemetry from Lotek.', [formatAxiosError(error)]);
    }
  }

  /**
   * Get a map of device serials to their telemetry activity statistics.
   *
   * @returns {Promise<Map<number, { telemetryCount: number, lastAcquisition: string | null }>} The device activity map
   */
  async getDevicesActivitiesMap(): Promise<Map<number, { telemetryCount: number; lastAcquisition: string | null }>> {
    const deviceActivityStats = await this.telemetryLotekRepository.getDeviceActivityStatistics();
    return new Map(
      deviceActivityStats.map((value) => [
        value.serial,
        { telemetryCount: value.telemetry_count, lastAcquisition: value.last_acquisition }
      ])
    );
  }

  /**
   * Batch insert telemetry data into SIMS.
   *
   * @param {LotekPayload[]} telemetry - List of telemetry data to create
   * @param {number} [batchSize=1000] - Number of items to insert in a single batch
   * @returns {Promise<number>} The number of telemetry records created
   */
  async batchCreateTelemetry(telemetry: LotekPayload[], batchSize = 1000): Promise<number> {
    const telemetryBatches = chunk(telemetry, batchSize);

    const rowCounts = await Promise.all(
      telemetryBatches.map((batch) => this.telemetryLotekRepository.createLotekTelemetry(batch))
    );

    return rowCounts.reduce((acc, count) => acc + count, 0);
  }

  /**
   * Process (fetch and insert) telemetry data for a list of Lotek tasks.
   *
   * @param {LotekTask[]} tasks - List of Lotek tasks to process
   * @param {TelemetryProcessingOptions} options - Telemetry processing options
   * @returns {Promise<QueueResult<LotekTask, TelemetryProcessingResult>[]>} The telemetry processing results
   */
  async processTelemetry(
    tasks: LotekTask[],
    options: TelemetryProcessingOptions
  ): Promise<QueueResult<LotekTask, TelemetryProcessingResult>[]> {
    const activityMap = await this.getDevicesActivitiesMap();

    return taskQueue(
      tasks,
      async (task: LotekTask) => {
        // Track the telemetry processing state
        const telemetry = { total: 0, new: 0, created: 0 };

        // Fetch the total number of device telemetry records from Lotek API
        telemetry.total = await this.fetchTelemetryCountFromLotek({ deviceId: task.serial });

        // Get the device activity statistics from SIMS
        const deviceActivity = activityMap.get(task.serial) ?? { telemetryCount: 0, lastAcquisition: null };

        // Calculate the number of new telemetry records ie: telemetry records that are not in SIMS
        telemetry.new = telemetry.total - deviceActivity?.telemetryCount;

        if (telemetry.new) {
          // Fetch telemetry data from Lotek API
          const lotekAPITelemetry = await this.fetchTelemetryFromLotek({
            deviceId: task.serial,
            dtEnd: options.endDate,
            // If no start date is provided, use the last acquisition date from SIMS
            dtStart: options.startDate ?? deviceActivity?.lastAcquisition ?? undefined
          });

          // Batch insert telemetry data into SIMS
          telemetry.created = await this.batchCreateTelemetry(lotekAPITelemetry, options.batchSize);
        }

        defaultLog.info({
          label: 'processTelemetry',
          device_key: getTelemetryDeviceKey({ vendor: 'lotek', serial: task.serial }),
          telemetry: telemetry
        });

        return { new: telemetry.new, created: telemetry.created };
      },
      options.concurrently
    );
  }
}
