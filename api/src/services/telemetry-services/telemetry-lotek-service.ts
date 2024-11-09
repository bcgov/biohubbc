import axios from 'axios';
import { chunk } from 'lodash';
import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { TelemetryLotekRepository } from '../../repositories/telemetry-repositories/telemetry-lotek-repository';
import {
  LotekAPIQuery,
  LotekPayload,
  LotekTask
} from '../../repositories/telemetry-repositories/telemetry-lotek-repository.interface';
import { getLogger } from '../../utils/logger';
import { QueueResult, taskQueue } from '../../utils/task-queue';
import { DBService } from '../db-service';
import { LotekAPIDevice } from './telemetry-lotek-service.interface';
import { keysToLowerCase } from './telemetry-utils';
import { TelemetryProcessingOptions, TelemetryProcessingResult } from './telemetry.interface';

const defaultLog = getLogger('TelemetryLotekService');

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
  token: string | undefined;

  telemetryLotekRepository: TelemetryLotekRepository;

  /**
   * Creates an instance of TelemetryLotekService.
   *
   * @param {IDBConnection} connection
   */
  constructor(connection: IDBConnection) {
    super(connection);

    this.token = undefined;
    this.telemetryLotekRepository = new TelemetryLotekRepository(connection);
  }

  /**
   * Get the base URL for the Lotek API.
   *
   * @returns {URL}
   */
  getLotekBaseURL(): URL {
    return new URL(process.env.LOTEK_API_HOST ?? 'https://webservice.lotek.com');
  }

  /**
   * Get the URL for fetching Lotek telemetry data for a specific device.
   *
   * @param {LotekAPIQuery} query - Lotek API request query
   * @returns {URL}
   */
  getLotekTelemetryURL(query: LotekAPIQuery): URL {
    const url = this.getLotekBaseURL();

    url.searchParams.append('deviceId', String(query.deviceId));

    if (query.dtStart) {
      url.searchParams.append('dtStart', query.dtStart);
    }

    if (query.dtEnd) {
      url.searchParams.append('dtend', query.dtEnd);
    }

    return url;
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

    const url = this.getLotekBaseURL();
    url.pathname = 'API/user/login';

    try {
      const response = await axios.post(
        url.toString(),
        {
          username: process.env.LOTEK_ACCOUNT_USERNAME,
          password: process.env.LOTEK_ACCOUNT_PASSWORD,
          grant_type: 'password'
        },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      // Cache token for future requests
      this.token = response.data.access_token;

      return response.data.access_token;
    } catch (error) {
      defaultLog.error({ label: 'fetchTokenFromLotek', message: 'error', error });
      throw new ApiGeneralError('Failed to authenticate with Lotek.');
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
    const url = this.getLotekBaseURL();
    url.pathname = 'API/devices';

    try {
      const response = await axios.get<LotekAPIDevice[]>(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      defaultLog.error({ label: 'fetchDevicesFromLotek', message: 'error', error });
      throw new ApiGeneralError('Failed to fetch devices from Lotek.');
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
    const token = await this.fetchTokenFromLotek();
    const url = this.getLotekTelemetryURL(query);
    url.pathname = 'API/gps/count';

    try {
      const response = await axios.get<string>(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const match = response.data.match(/\d+/)?.[0]; // response.data = 'Number of Positions: 123' -> match = '123'
      const count = match ? parseInt(match, 10) : NaN; // -> count = 123 or NaN

      if (isNaN(count)) {
        throw new ApiGeneralError('Failed to parse count from Lotek response');
      }

      return count;
    } catch (error) {
      defaultLog.error({ label: 'fetchTelemetryCountFromLotek', message: 'error', error });
      throw new ApiGeneralError('Failed to fetch device telemetry count from Lotek.');
    }
  }

  /**
   * Fetch telemetry data for a single device from Lotek API.
   *
   * @param {LotekAPIQuery} query - Lotek API request query
   * @returns {Promise<TelemetryLotekAPIRecord[]>} Raw API telemetry data
   */
  async fetchTelemetryFromLotek(query: LotekAPIQuery): Promise<LotekPayload[]> {
    const token = await this.fetchTokenFromLotek();
    const url = this.getLotekTelemetryURL(query);
    url.pathname = 'API/gps';

    try {
      // Note: Lotek is using SentenceCased keys in their API response
      const response = await axios.get<LotekPayload[]>(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.map((record) => keysToLowerCase(record));
    } catch (error) {
      defaultLog.error({ label: 'fetchTelemetryFromLotek', message: 'error', error });
      throw new ApiGeneralError('Failed to fetch device telemetry from Lotek.');
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
        { telemetryCount: value.telemetry_count, lastAcquisition: value.last_acquistion }
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

        defaultLog.info({ label: 'processTelemetry', ...telemetry });
        return { new: telemetry.new, created: telemetry.created };
      },
      options.concurrently
    );
  }
}
