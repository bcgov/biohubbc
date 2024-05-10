import { IDBConnection } from '../database/db';
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
  measurements: {
    quantitative: CBQuantitativeMeasurementTypeDefinition[];
    qualitative: CBQualitativeMeasurementTypeDefinition[];
  };
  markingBodyLocations: { id: string; key: string; value: string }[];
}

/**
 * Sample Stratum Repository
 *
 * @export
 * @class SampleStratumService
 * @extends {DBService}
 */
export class StandardsService extends DBService {
  platformService: PlatformService;
  critterbaseService: CritterbaseService;

  constructor(connection: IDBConnection) {
    super(connection);
    this.platformService = new PlatformService(connection);
    this.critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });
  }

  /**
   * Gets all survey Sample Stratums.
   *
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<standardsRecord[]>}
   * @memberof standardsService
   */
  async getSpeciesStandards(tsn: number): Promise<ISpeciesStandardsResponse> {
    // Fetch all measurement type definitions from Critterbase for the unique taxon_measurement_ids
    const response = await Promise.all([
      this.platformService.getTaxonomyByTsns([tsn]),
      this.critterbaseService.getTaxonBodyLocations(String(tsn)),
      this.critterbaseService.getTaxonMeasurements(String(tsn))
    ]);

    return {
      tsn: tsn,
      scientificName: response[0][0].scientificName,
      markingBodyLocations: response[1],
      measurements: response[2]
    };
  }
}
