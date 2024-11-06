import axios from 'axios';
import fastq from 'fastq';
import { chunk } from 'lodash';
import { IDBConnection } from '../../database/db';
import { TelemetryVectronicRepository } from '../../repositories/telemetry-repositories/telemetry-vectronic-repository';
import {
  CreateVectronicTelemetry,
  ExtendedVectronicCredential,
  VectronicAPIQuery
} from '../../repositories/telemetry-repositories/telemetry-vectronic-repository.interface';
import { DBService } from '../db-service';
import { TelemetryQueueResult } from './telemetry.interface';

/**
 * This service is responsible for fetching telemetry data from the Vectronic API and storing it in SIMS.
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
   * @returns {URL}
   */
  getVectronicBaseURL(): URL {
    return new URL(process.env.VECTRONIC_API_HOST ?? 'https://api.vectronic-wildlife.com/v2');
  }

  /**
   * Get the URL for fetching Vectronic telemetry data for a specific device.
   *
   * @param {VectronicAPIQuery} query - Vectronic API request query
   * @returns {URL}
   */
  getVectronicTelemetryURL(query: VectronicAPIQuery): URL {
    const url = this.getVectronicBaseURL();

    url.pathname += `/${query.idcollar}/gps`;

    url.searchParams.append('collarkey', query.collarkey);
    url.searchParams.append('onlyValid', 'true'); // TODO: Invesitgate this param

    if (query.beforeAcquisition) {
      url.searchParams.append('beforeAcquisition', query.beforeAcquisition);
    }

    if (query.afterAcquisition) {
      url.searchParams.append('afterAcquisition', query.afterAcquisition);
    }

    return url;
  }

  /**
   * Fetch vectronic device telemetry data from the Vectronic API.
   *
   * @param {VectronicAPIQuery} query - Vectronic API request query
   * @returns {Promise<TODO>}
   */
  async fetchDeviceTelemetry(query: VectronicAPIQuery): Promise<any[]> {
    const url = this.getVectronicTelemetryURL(query).toString();

    const response = await axios.get(url);

    return response.data;
  }

  /**
   * Process (fetch and insert) telemetry data for a list of vectronic API queries (device credential + date range).
   *
   * @param {VectronicAPIQuery[]} queries - List of vectronic API queries
   * @param {number} concurrently - Number of requests to make concurrently
   * @param {number} batchSize - Number of items to insert in a single batch
   * @returns {Promise<>}
   */
  async processTelemetry(queries: VectronicAPIQuery[], concurrently: number, batchSize: number) {
    const queueResult: TelemetryQueueResult[] = [];

    const queue = fastq.promise(async (task: VectronicAPIQuery): Promise<void> => {
      let telemetryCount = 0;

      try {
        // 1. Fetch telemetry data for a single device
        const deviceTelemetry = await this.fetchDeviceTelemetry(task);

        // 2. Batch insert telemetry data into SIMS
        telemetryCount = await this.batchCreateTelemetry(deviceTelemetry, batchSize);

        // 3. Update telemetry
        queueResult.push({ serial: task.idcollar, telemetry: telemetryCount, error: undefined });
      } catch (error: any) {
        queueResult.push({ serial: task.idcollar, telemetry: telemetryCount, error: error.message });
      }
    }, concurrently);

    for (const query of queries) {
      queue.push(query);
    }

    await queue.drain();

    return queueResult;
  }

  /**
   * Get all Vectronic credentials from SIMS.
   *
   * @returns {*} {Promise<ExtendedVectronicCredential[]>}
   */
  async getDeviceCredentials(): Promise<ExtendedVectronicCredential[]> {
    return this.telemetryVectronicRepository.getAllVectronicCredentials();
  }

  /**
   * Create Vectronic telemetry records in SIMS in batches.
   *
   * @param {CreateVectronicTelemetry} telemetry - Vectronic telemetry records
   * @returns {Promise<TODO>}
   */
  async batchCreateTelemetry(telemetry: CreateVectronicTelemetry[], batchSize = 1000): Promise<number> {
    const telemetryBatches = chunk(telemetry, batchSize);

    // Insert telemetry data in batches
    const rowCounts = await Promise.all(
      telemetryBatches.map((batch) => this.telemetryVectronicRepository.createVectronicTelemetry(batch))
    );

    // Return the total number of inserted rows
    return rowCounts.reduce((acc, count) => acc + count, 0);
  }
}
