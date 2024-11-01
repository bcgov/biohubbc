import axios from 'axios';
import { IDBConnection } from '../../database/db';
import { TelemetryVectronicRepository } from '../../repositories/telemetry-repositories/telemetry-vectronic-repository';
import {
  CreateVectronicTelemetry,
  VectronicAPIQuery,
  VectronicCredential
} from '../../repositories/telemetry-repositories/telemetry-vectronic-repository.interface';
import { DBService } from '../db-service';

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
    return new URL(process.env.VECTRONIC_API_HOST ?? 'TODO');
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
   * Fetch collar telemetry data from Vectronic API.
   *
   * @param {VectronicAPIQuery} query - Vectronic API request query
   * @returns {Promise<TODO>}
   */
  async fetchVectronicTelemetry(query: VectronicAPIQuery): Promise<any> {
    const url = this.getVectronicTelemetryURL(query).toString();

    const response = await axios.get(url);

    return response.data;
  }

  /**
   * Get all Vectronic credentials stored in SIMS.
   *
   * @returns {Promise<TODO>}
   */
  async getAllVectronicCredentials(): Promise<VectronicCredential[]> {
    return [{ idcollar: 1221, collarkey: 'todo' }];
  }

  /**
   * Fetch Vectronic telemetry data for all stored credentials.
   *
   * @param {CreateVectronicTelemetry} telemetry - Vectronic telemetry records
   * @returns {Promise<TODO>}
   */
  async createVectronicTelemetry(telemetry: CreateVectronicTelemetry[]): Promise<void> {
    return this.telemetryVectronicRepository.createVectronicTelemetry(telemetry);
  }
}
