import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from './critterbase-service';
import { DBService } from './db-service';
import { PlatformService } from './platform-service';

export interface ISpeciesStandardsResponse {
  tsn: number;
  scientificName: string;
  measurements?: {
    quantitative: CBQuantitativeMeasurementTypeDefinition[];
    qualitative: CBQualitativeMeasurementTypeDefinition[];
  };
  marking_body_locations: {id: string; key: string; value: string}[]
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
    const platformService = new PlatformService(this.connection);

    // Fetch all measurement type definitions from Critterbase for the unique taxon_measurement_ids
    const response = await Promise.all([
      platformService.getTaxonomyByTsns([tsn]),
      critterbaseService.getTaxonBodyLocations(String(tsn)),
      critterbaseService.getTaxonMeasurements(String(tsn))
    ]);

    return {
      tsn: tsn,
      scientificName: response[0][0].scientificName,
      marking_body_locations: response[1],
      measurements: response[2]
    };
  }
}
