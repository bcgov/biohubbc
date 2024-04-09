import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from './critterbase-service';
import { DBService } from './db-service';

export interface ISpeciesStandardsResponse {
  measurements?: {
    quantitative: CBQuantitativeMeasurementTypeDefinition;
    qualitative: CBQualitativeMeasurementTypeDefinition;
  };
  marking_body_locations: string[]
}

/**
 * Sample Stratum Repository
 *
 * @export
 * @class SampleStratumService
 * @extends {DBService}
 */
export class StandardsService extends DBService {
  /**
   * Gets all survey Sample Stratums.
   *
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<standardsRecord[]>}
   * @memberof standardsService
   */
  async getSpeciesStandards(tsn: number): Promise<ISpeciesStandardsResponse> {
    const critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });

    // Fetch all measurement type definitions from Critterbase for the unique taxon_measurement_ids
    const response = await Promise.all([critterbaseService.getTaxonBodyLocations(String(tsn))]);

    return { marking_body_locations: response[0] };
  }
}
