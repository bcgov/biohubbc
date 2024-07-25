import { IDBConnection } from '../database/db';
import { EnvironmentStandards, ISpeciesStandards } from '../models/standards-view';
import { StandardsRepository } from '../repositories/standards-repository';
import { CritterbaseService } from './critterbase-service';
import { DBService } from './db-service';
import { PlatformService } from './platform-service';

/**
 * Standards Repository
 *
 * @export
 * @class StandardsService
 * @extends {DBService}
 */
export class StandardsService extends DBService {
  platformService: PlatformService;
  critterbaseService: CritterbaseService;
  standardsRepository: StandardsRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.platformService = new PlatformService(connection);
    this.critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });
    this.standardsRepository = new StandardsRepository(connection);
  }

  /**
   * Gets species standards
   *
   * @param {number} tsn
   * @return {ISpeciesStandards}
   * @memberof standardsService
   */
  async getSpeciesStandards(tsn: number): Promise<ISpeciesStandards> {
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

  /**
   * Gets environment standards
   *
   * @return {EnvironmentStandard[]}
   * @memberof standardsService
   */
  async getEnvironmentStandards(): Promise<EnvironmentStandards> {
    const response = await this.standardsRepository.getEnvironmentStandards();

    return response;
  }
}
