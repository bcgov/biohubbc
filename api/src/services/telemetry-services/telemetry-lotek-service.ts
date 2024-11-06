import axios from 'axios';
import fastq from 'fastq';
import { chunk } from 'lodash';
import { IDBConnection } from '../../database/db';
import { TelemetryLotekRepository } from '../../repositories/telemetry-repositories/telemetry-lotek-repository';
import { LotekAPIQuery } from '../../repositories/telemetry-repositories/telemetry-lotek-repository.interface';
import { CreateVectronicTelemetry } from '../../repositories/telemetry-repositories/telemetry-vectronic-repository.interface';
import { DBService } from '../db-service';
import { formatVectronicAPITelemetry } from './telemetry-utils';
import { TelemetryVectronicAPIRecord } from './telemetry-vectronic-service.interface';
import { TelemetryQueueResult } from './telemetry.interface';

/**
 * This service is responsible for fetching telemetry data from the Lotek API and storing it in SIMS.
 *
 * @export
 * @class TelemetryVendorService
 * @extends {DBService}
 */
export class TelemetryLotekService extends DBService {
  telemetryLotekRepository: TelemetryLotekRepository;

  /**
   * Creates an instance of TelemetryLotekService.
   *
   * @param {IDBConnection} connection
   */
  constructor(connection: IDBConnection) {
    super(connection);

    this.telemetryLotekRepository = new TelemetryLotekRepository(connection);
  }

  /**
   * Get the base URL for the Lotek API.
   *
   * @returns {URL}
   */
  getLotekBaseURL(): URL {
    return new URL(process.env.LOTEK_API_HOST ?? 'https://api.lotek.com/API');
  }

  /**
   * Get the URL for fetching Lotek telemetry data for a specific device.
   *
   * @param {LotekAPIQuery} query - Lotek API request query
   * @returns {URL}
   */
  getLotekTelemetryURL(query: LotekAPIQuery): URL {
    const url = this.getLotekBaseURL();

    url.pathname += '/gps';

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
   * Authenticate admin account with the Lotek API.
   *
   * @returns {Promise<string>} The access token
   */
  async authenticate(): Promise<string> {
    const url = this.getLotekBaseURL();

    url.pathname += 'user/login';

    const response = await axios.post(
      url.toString(),
      {
        username: process.env.LOTEK_ACCOUNT_USERNAME, // Todo: Add these values to ENV
        password: process.env.LOTEK_ACCOUNT_PASSWORD,
        grant_type: 'password'
      },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return response.data.access_token;
  }

  /**
   * Fetch device telemetry data from Lotek API.
   *
   * @param {LotekAPIQuery} query - Lotek API request query
   * @param {string} token - Lotek access token
   * @returns {Promise<TelemetryVectronicAPIRecord[]>} Raw API telemetry data
   */
  async fetchDeviceTelemetry(query: LotekAPIQuery, token: string): Promise<TelemetryVectronicAPIRecord[]> {
    const url = this.getLotekTelemetryURL(query).toString();

    const response = await axios.get<TelemetryVectronicAPIRecord[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  }

  /**
   * Process (fetch and insert) telemetry data for a list of Lotek API queries (device credentials + date ranges).
   *
   * @param {LotekAPIQuery[]} queries - List of Lotek API queries
   * @param {number} concurrently - Number of requests to make concurrently
   * @param {number} batchSize - Number of items to insert in a single batch
   * @returns {Promise<TelemetryQueueResult[]>} The telemetry processing results
   */
  async processTelemetry(
    queries: LotekAPIQuery[],
    concurrently: number,
    batchSize: number
  ): Promise<TelemetryQueueResult[]> {
    const token = await this.authenticate();
    const queueResult: TelemetryQueueResult[] = [];

    const queue = fastq.promise(async (task: LotekAPIQuery): Promise<void> => {
      let telemetryCount = 0;

      try {
        // 1. Fetch single device telemetry data from Lotek API
        const deviceTelemetry = await this.fetchDeviceTelemetry(task, token);

        // 2. Format telemetry data for SIMS insert
        const formattedTelemetry = deviceTelemetry.map((telemetry) => formatVectronicAPITelemetry(telemetry));

        // 3. Batch insert telemetry data
        telemetryCount = await this.batchCreateTelemetry(formattedTelemetry, batchSize);

        // 4. Track results
        queueResult.push({ serial: task.deviceId, telemetry: telemetryCount, error: undefined });
      } catch (error: any) {
        queueResult.push({ serial: task.deviceId, telemetry: telemetryCount, error: error.message });
      }
    }, concurrently);

    for (const query of queries) {
      queue.push(query);
    }

    await queue.drain();

    return queueResult;
  }

  // TODO: update type (createVectonicTelemetry)
  async batchCreateTelemetry(telemetry: CreateVectronicTelemetry[], batchSize = 1000): Promise<number> {
    const telemetryBatches = chunk(telemetry, batchSize);

    const rowCounts = await Promise.all(
      telemetryBatches.map((batch) => this.telemetryLotekRepository.createLotekTelemetry(batch))
    );

    return rowCounts.reduce((acc, count) => acc + count, 0);
  }
}
