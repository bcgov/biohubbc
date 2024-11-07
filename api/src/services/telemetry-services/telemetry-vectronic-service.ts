import axios from 'axios';
import { chunk } from 'lodash';
import { IDBConnection } from '../../database/db';
import { TelemetryVectronicRepository } from '../../repositories/telemetry-repositories/telemetry-vectronic-repository';
import {
  CreateVectronicTelemetry,
  ExtendedVectronicCredential,
  VectronicAPIQuery,
  VectronicTask
} from '../../repositories/telemetry-repositories/telemetry-vectronic-repository.interface';
import { getLogger } from '../../utils/logger';
import { QueueResult, taskQueue } from '../../utils/task-queue';
import { DBService } from '../db-service';
import { TelemetryProcessingOptions, TelemetryProcessingResult } from './telemetry.interface';
const defaultLog = getLogger('TelemetryLotekService');

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
   * @returns {URL}
   */
  getVectronicBaseURL(): URL {
    return new URL(process.env.VECTRONIC_API_HOST ?? 'https://api.vectronic-wildlife.com');
  }

  /**
   * Get the URL for fetching Vectronic telemetry data for a specific device.
   *
   * @param {VectronicAPIQuery} query - Vectronic API request query
   * @returns {URL}
   */
  getVectronicTelemetryURL(query: VectronicAPIQuery): URL {
    const url = this.getVectronicBaseURL();

    url.pathname = `v2/${query.idcollar}/gps`;

    url.searchParams.append('collarkey', query.collarkey);
    url.searchParams.append('onlyValid', 'true'); // TODO: Invesitgate this param

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
   * @returns {Promise<TODO>}
   */
  async fetchTelemetryFromVectronic(query: VectronicAPIQuery): Promise<any[]> {
    const url = this.getVectronicTelemetryURL(query);

    const response = await axios.get(url.toString());

    return response.data;
  }

  /**
   * Fetch vectronic device telemetry count from the Vectronic API.
   *
   * @param {VectronicAPIQuery} query - Vectronic API request query
   * @returns {Promise<number>}
   */
  async fetchTelemetryCountFromVectronic(query: VectronicAPIQuery): Promise<number> {
    const url = this.getVectronicTelemetryURL(query);

    url.pathname = `V2/${query.idcollar}/gps/count`;

    const response = await axios.get(url.toString());

    return response.data;
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

  /**
   * Get a map of device serials to their telemetry activity statistics.
   *
   * @returns {Promise<Map<number, { telemetryCount: number, maxIdposition: number | null }>} The device activity map
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
   * @returns {Promise<QueueResult<VectronicTask, TelemetryProcessingResult>[]>}
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
