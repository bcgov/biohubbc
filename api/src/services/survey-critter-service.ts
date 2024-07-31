import { IDBConnection } from '../database/db';
import { IAnimalAdvancedFilters } from '../models/animal-view';
import { IAllTelemetryAdvancedFilters } from '../models/telemetry-view';
import { SurveyCritterRecord, SurveyCritterRepository } from '../repositories/survey-critter-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { CritterbaseService, ICritter } from './critterbase-service';
import { DBService } from './db-service';

export type FindCrittersResponse = Pick<
  ICritter,
  'wlh_id' | 'animal_id' | 'sex' | 'itis_tsn' | 'itis_scientific_name' | 'critter_comment'
> &
  Pick<SurveyCritterRecord, 'critter_id' | 'survey_id' | 'critterbase_critter_id'>;

/**
 * Service layer for survey critters.
 *
 * @export
 * @class SurveyCritterService
 * @extends {DBService}
 */
export class SurveyCritterService extends DBService {
  critterRepository: SurveyCritterRepository;
  critterbaseService: CritterbaseService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.critterRepository = new SurveyCritterRepository(connection);
    this.critterbaseService = new CritterbaseService({
      keycloak_guid: connection.systemUserGUID(),
      username: connection.systemUserIdentifier()
    });
  }

  /**
   * Get all critter associations for the given survey. This only gets you critter ids, which can be used to fetch
   * details from the external system.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyCritterRecord[]>}
   * @memberof SurveyCritterService
   */
  async getCrittersInSurvey(surveyId: number): Promise<SurveyCritterRecord[]> {
    return this.critterRepository.getCrittersInSurvey(surveyId);
  }

  /**
   * Get all critter associations for the given survey. This only gets you critter ids, which can be used to fetch
   * details from the external system.
   *
   * @param {number} surveyId
   * @param {number} critterId
   * @return {*}  {Promise<SurveyCritterRecord[]>}
   * @memberof SurveyCritterService
   */
  async getCritterById(surveyId: number, critterId: number): Promise<SurveyCritterRecord> {
    return this.critterRepository.getCritterById(surveyId, critterId);
  }

  /**
   * Retrieves all critters that are available to the user, based on their permissions.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {IAnimalAdvancedFilters} [filterFields]
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<FindCrittersResponse[]>}
   * @memberof SurveyCritterService
   */
  async findCritters(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields?: IAnimalAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindCrittersResponse[]> {
    // --- Step 1 -----------------------------

    // The SIMS critter records the user has access to
    const simsCritters = await this.critterRepository.findCritters(isUserAdmin, systemUserId, filterFields, pagination);

    if (!simsCritters.length) {
      // Exit early if there are no SIMS critters
      return [];
    }

    // --- Step 2 -----------------------------

    const critterbaseCritterIds = simsCritters.map((critter) => critter.critterbase_critter_id);

    const critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });
    // The detailed critter records from Critterbase
    const critterbaseCritters = await critterbaseService.getMultipleCrittersByIds(critterbaseCritterIds);

    // --- Step 3 -----------------------------

    // Parse/combine the telemetry, deployment, and critter records into the final response
    const response: FindCrittersResponse[] = [];
    for (const critterbaseCritter of critterbaseCritters) {
      const simsCritter = simsCritters.find(
        (critter) => critter.critterbase_critter_id === critterbaseCritter.critter_id
      );

      if (!simsCritter) {
        continue;
      }

      response.push({
        wlh_id: critterbaseCritter.wlh_id,
        animal_id: critterbaseCritter.animal_id,
        sex: critterbaseCritter.sex,
        itis_tsn: critterbaseCritter.itis_tsn,
        itis_scientific_name: critterbaseCritter.itis_scientific_name,
        critter_comment: critterbaseCritter.critter_comment,
        ...simsCritter
      });
    }

    return response;
  }

  /**
   * Retrieves the count of all critters that are available to the user, based on their permissions and provided
   * filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {IAllTelemetryAdvancedFilters} [filterFields]
   * @return {*}  {Promise<number>}
   * @memberof SurveyCritterService
   */
  async findCrittersCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields?: IAllTelemetryAdvancedFilters
  ): Promise<number> {
    return this.critterRepository.findCrittersCount(isUserAdmin, systemUserId, filterFields);
  }

  /**
   * Add a critter as part of this survey. Does not create anything in the external system.
   *
   * @param {number} surveyId
   * @param {string} critterBaseCritterId
   * @return {*}  {Promise<number>}
   * @memberof SurveyCritterService
   */
  async addCritterToSurvey(surveyId: number, critterBaseCritterId: string): Promise<number> {
    const response = await this.critterRepository.addCrittersToSurvey(surveyId, [critterBaseCritterId]);

    return response[0];
  }

  /**
   * Add multiple critters to a survey. Does not create anything in the external system.
   *
   * @param {number} surveyId
   * @param {string} critterBaseCritterIds
   * @return {*}  {Promise<number>}
   * @memberof SurveyCritterService
   */
  async addCrittersToSurvey(surveyId: number, critterBaseCritterIds: string[]): Promise<number[]> {
    return this.critterRepository.addCrittersToSurvey(surveyId, critterBaseCritterIds);
  }

  /**
   * Update critter already in survey. Only touches audit columns.
   *
   * @param {number} critterId
   * @param {string} critterBaseCritterId
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterService
   */
  async updateCritter(critterId: number, critterBaseCritterId: string): Promise<void> {
    return this.critterRepository.updateCritter(critterId, critterBaseCritterId);
  }

  /**
   * Removes critters from the survey. Does not affect the critters in the external system.
   *
   * @param {number} surveyId
   * @param {number[]} critterIds
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterService
   */
  async removeCrittersFromSurvey(surveyId: number, critterIds: number[]): Promise<void> {
    return this.critterRepository.removeCrittersFromSurvey(surveyId, critterIds);
  }

    /**
   * Get unique Set of critter aliases (animal id / nickname) of a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ICritter[]>}
   * @memberof SurveyCritterService
   */
  async getUniqueSurveyCritterAliases(surveyId: number): Promise<Set<string>> {
    const surveyCritters = await this.getCrittersInSurvey(surveyId);

    const critterbaseCritterIds = surveyCritters.map((critter) => critter.critterbase_critter_id);

    const critters = await this.critterbaseService.getMultipleCrittersByIds(critterbaseCritterIds);

    // Return a unique Set of non-null critterbase aliases of a Survey
    // Note: The type from filtered critters should be Set<string> not Set<string | null>
    return new Set(critters.filter(Boolean).map((critter) => critter.animal_id)) as Set<string>;
  }
}
