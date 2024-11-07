import axios from 'axios';
import { chunk } from 'lodash';
import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { TelemetryLotekRepository } from '../../repositories/telemetry-repositories/telemetry-lotek-repository';
import { LotekAPIQuery } from '../../repositories/telemetry-repositories/telemetry-lotek-repository.interface';
import { CreateVectronicTelemetry } from '../../repositories/telemetry-repositories/telemetry-vectronic-repository.interface';
import { taskQueue } from '../../utils/task-queue';
import { DBService } from '../db-service';
import { LotekAPIDevice, TelemetryLotekAPIRecord } from './telemetry-lotek-service.interface';
import { TelemetryVectronicAPIRecord } from './telemetry-vectronic-service.interface';

/**
 * This service is responsible for fetching telemetry data from the Lotek API and storing it in SIMS.
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

    url.pathname = 'API/gps';

    url.searchParams.append('deviceId', String(query.deviceId));

    if (query.dtstart) {
      url.searchParams.append('dtstart', query.dtstart);
    }

    if (query.dtend) {
      url.searchParams.append('dtend', query.dtend);
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
    } catch (error: any) {
      throw new ApiGeneralError('Failed to authenticate with Lotek.', [error.response.data]);
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
    } catch (error: any) {
      throw new ApiGeneralError('Failed to fetch devices from Lotek.', [error.response.data]);
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
      const response = await axios.get<TelemetryVectronicAPIRecord[]>(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.length;
    } catch (error: any) {
      throw new ApiGeneralError('Failed to fetch device telemetry count from Lotek.', [error.response.data]);
    }
  }

  /**
   * Fetch telemetry data for a single device from Lotek API.
   *
   * @param {LotekAPIQuery} query - Lotek API request query
   * @returns {Promise<TelemetryLotekAPIRecord[]>} Raw API telemetry data
   */
  async fetchTelemetryFromLotek(query: LotekAPIQuery): Promise<TelemetryLotekAPIRecord[]> {
    const token = await this.fetchTokenFromLotek();
    const url = this.getLotekTelemetryURL(query);

    try {
      const response = await axios.get<TelemetryLotekAPIRecord[]>(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      throw new ApiGeneralError('Failed to fetch device telemetry from Lotek.', [error.response.data]);
    }
  }

  /**
   * Get a map of device serials to their telemetry activity statistics.
   *
   * @returns {Promise<Map<number, { telemetryCount: number, lastAcquisition: Date }>} The device activity map
   */
  async getDevicesActivitiesMap() {
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
   * @param {CreateVectronicTelemetry[]} telemetry - List of telemetry data to create
   * @param {number} [batchSize=1000] - Number of items to insert in a single batch
   * @returns {Promise<number>} The number of telemetry records created
   */
  async batchCreateTelemetry(telemetry: CreateVectronicTelemetry[], batchSize = 1000): Promise<number> {
    const telemetryBatches = chunk(telemetry, batchSize);

    const rowCounts = await Promise.all(
      telemetryBatches.map((batch) => this.telemetryLotekRepository.createLotekTelemetry(batch))
    );

    return rowCounts.reduce((acc, count) => acc + count, 0);
  }

  /**
   * Process (fetch and insert) telemetry data for a list of Lotek API queries (device credentials + date ranges).
   *
   * @param {LotekAPIQuery[]} tasks - List of Lotek API queries
   * @param {number} concurrently - Number of requests to make concurrently
   * @param {number} batchSize - Number of items to insert in a single batch
   * @returns {Promise<TelemetryQueueResult[]>} The telemetry processing results
   */
  async processTelemetry(tasks: LotekAPIQuery[], concurrently: number, batchSize: number): Promise<any[]> {
    const activityMap = await this.getDevicesActivitiesMap();

    const result = await taskQueue(
      tasks,
      async (task: LotekAPIQuery) => {
        const lotekCount = await this.fetchTelemetryCountFromLotek(task);
        const deviceActivity = activityMap.get(task.deviceId) ?? { telemetryCount: 0, lastAcquisition: undefined };
        const newTelemetry = lotekCount - deviceActivity.telemetryCount;

        if (!newTelemetry) {
          return { new: 0, created: 0 };
        }

        const lotekAPITelemetry = await this.fetchTelemetryFromLotek(task);
        await this.batchCreateTelemetry(lotekAPITelemetry, batchSize);
      },
      concurrently
    );

    return result;
  }
}
