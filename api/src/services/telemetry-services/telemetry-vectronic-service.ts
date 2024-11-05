import axios from 'axios';
import fastq from 'fastq';
import { chunk } from 'lodash';
import { TelemetryCredentialVectronicRecord } from '../../database-models/telemetry_credential_vectronic';
import { IDBConnection } from '../../database/db';
import { TelemetryVectronicRepository } from '../../repositories/telemetry-repositories/telemetry-vectronic-repository';
import {
  CreateVectronicTelemetry,
  VectronicAPIQuery
} from '../../repositories/telemetry-repositories/telemetry-vectronic-repository.interface';
import { getLogger } from '../../utils/logger';
import { DBService } from '../db-service';

const defaultLog = getLogger('telemetry-vectronic-service');

const VECTRONIC_API_HOST = process.env.VECTRONIC_API_HOST ?? 'http://api.vectronic-wildlife.com/v2';

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
    return new URL(VECTRONIC_API_HOST);
  }

  /**
   * Get the URL for fetching Vectronic telemetry data for a specific collar credential.
   *
   * @param {VectronicAPIQuery} query - Vectronic API request query
   * @returns {URL}
   */
  getVectronicTelemetryURL(query: VectronicAPIQuery): URL {
    const url = this.getVectronicBaseURL();

    url.pathname = `${query.idcollar}/gps`;
    url.searchParams.append('collarkey', query.collarkey);

    if (query.dtstart) {
      url.searchParams.append('dtstart', query.dtstart);
    }

    if (query.dtend) {
      url.searchParams.append('dtend', query.dtend);
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
   * Process (fetch and insert) telemetry data for a list of vectronic API queries.
   *
   * @param {VectronicAPIQuery[]} queries - List of vectronic API queries
   * @param {number} concurrently - Number of requests to make concurrently
   * @param {number} batchSize - Number of items to insert in a single batch
   * @returns {Promise<>}
   */
  async processTelemetry(queries: VectronicAPIQuery[], concurrently: number, batchSize: number) {
    const queueProcess: { serial: number; telemetry: number; error?: Error }[] = [];

    let telemetryCount = 0;

    const queue = fastq.promise(async (task: VectronicAPIQuery): Promise<void> => {
      try {
        // 1. Fetch telemetry data for a single device
        const deviceTelemetry = await this.fetchDeviceTelemetry(task);

        // 2. Batch insert telemetry data into SIMS
        telemetryCount = await this.batchCreateTelemetry(deviceTelemetry, batchSize);

        // Todo: Is this needed? Do we want this to run for every device? Or just the cronjob?
        defaultLog.info({
          QProcess: {
            length: queue.length(),
            concurrency: queue.concurrency,
            serial: task.idcollar,
            telemetry: telemetryCount
          }
        });

        // 3. Update telemetry
        queueProcess.push({ serial: task.idcollar, telemetry: telemetryCount, error: undefined });
      } catch (error: any) {
        queueProcess.push({ serial: task.idcollar, telemetry: telemetryCount, error: error.message });
      }
    }, concurrently);

    for (const query of queries) {
      queue.push(query);
    }

    await queue.drain();

    return queueProcess;
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
