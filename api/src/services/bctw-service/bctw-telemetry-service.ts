import { GeometryCollection } from 'geojson';
import { ICreateManualTelemetry, IManualTelemetry } from '../../models/bctw';
import { BctwService } from './bctw-service';
import {
  DELETE_MANUAL_TELEMETRY,
  GET_TELEMETRY_POINTS_ENDPOINT,
  GET_TELEMETRY_TRACKS_ENDPOINT,
  MANUAL_AND_VENDOR_TELEMETRY,
  MANUAL_TELEMETRY,
  VENDOR_TELEMETRY
} from '../../constants/bctw-routes';

export class BctwTelemetryService extends BctwService {
  /**
   * Get all telemetry points for an animal.
   * The geometry will be points, and the properties will include the critter id and deployment id.
   * @param critterId uuid
   * @param startDate
   * @param endDate
   * @return {*}  {Promise<GeometryCollection>}
   * @memberof BctwService
   */
  async getCritterTelemetryPoints(critterId: string, startDate: Date, endDate: Date): Promise<GeometryCollection> {
    return this._makeGetRequest(GET_TELEMETRY_POINTS_ENDPOINT, {
      critter_id: critterId,
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
  }

  /**
   * Get all telemetry tracks for an animal.
   * The geometry will be lines, and the properties will include the critter id and deployment id.
   * The lines are actually just generated on the fly by the the db using the same points as getCritterTelemetryPoints.
   *
   * @param critterId uuid
   * @param startDate
   * @param endDate
   * @return {*}  {Promise<GeometryCollection>}
   * @memberof BctwService
   */
  async getCritterTelemetryTracks(critterId: string, startDate: Date, endDate: Date): Promise<GeometryCollection> {
    return this._makeGetRequest(GET_TELEMETRY_TRACKS_ENDPOINT, {
      critter_id: critterId,
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
  }

  /**
   * Get all manual telemetry records
   * This set of telemetry is mostly useful for testing purposes.
   *
   * @returns {*} IManualTelemetry[]
   **/
  async getManualTelemetry(): Promise<IManualTelemetry[]> {
    return this._makeGetRequest(MANUAL_TELEMETRY);
  }

  /**
   * retrieves manual telemetry from list of deployment ids
   *
   * @async
   * @param {string[]} deployment_ids - bctw deployments
   * @returns {*} IManualTelemetry[]
   */
  async getManualTelemetryByDeploymentIds(deployment_ids: string[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.post(`${MANUAL_TELEMETRY}/deployments`, deployment_ids);
    return res.data;
  }

  /**
   * retrieves manual telemetry from list of deployment ids
   *
   * @async
   * @param {string[]} deployment_ids - bctw deployments
   * @returns {*} IManualTelemetry[]
   */
  async getVendorTelemetryByDeploymentIds(deployment_ids: string[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.post(`${VENDOR_TELEMETRY}/deployments`, deployment_ids);
    return res.data;
  }

  /**
   * retrieves manual and vendor telemetry from list of deployment ids
   *
   * @async
   * @param {string[]} deploymentIds - bctw deployments
   * @returns {*} IManualTelemetry[]
   */
  async getAllTelemetryByDeploymentIds(deploymentIds: string[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.post(`${MANUAL_AND_VENDOR_TELEMETRY}/deployments`, deploymentIds);
    return res.data;
  }

  /**
   * Delete manual telemetry records by telemetry_manual_id
   * Note: This is a post request that accepts an array of ids
   * @param {uuid[]} telemetry_manaual_ids
   *
   * @returns {*} IManualTelemetry[]
   **/
  async deleteManualTelemetry(telemetry_manual_ids: string[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.post(DELETE_MANUAL_TELEMETRY, telemetry_manual_ids);
    return res.data;
  }

  /**
   * Bulk create manual telemetry records
   * @param {ICreateManualTelemetry[]} payload
   *
   * @returns {*} IManualTelemetry[]
   **/
  async createManualTelemetry(payload: ICreateManualTelemetry[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.post(MANUAL_TELEMETRY, payload);
    return res.data;
  }

  /**
   * Bulk update manual telemetry records
   * @param {IManualTelemetry} payload
   *
   * @returns {*} IManualTelemetry[]
   **/
  async updateManualTelemetry(payload: IManualTelemetry[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.patch(MANUAL_TELEMETRY, payload);
    return res.data;
  }
}
