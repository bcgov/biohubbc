import { IDBConnection } from '../database/db';
import { SurveyCritterRecord, SurveyCritterRepository } from '../repositories/survey-critter-repository';
import { CritterbaseService } from './critterbase-service';
import { DBService } from './db-service';

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
   * Get all critter associations for the given survey. This only gets you critter ids, which can be used to fetch details from the external system.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyCritterRecord[]>}
   * @memberof SurveyCritterService
   */
  async getCrittersInSurvey(surveyId: number): Promise<SurveyCritterRecord[]> {
    return this.critterRepository.getCrittersInSurvey(surveyId);
  }

  /**
   * Add a critter to a survey. Does not create anything in the external system.
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
   * Upsert a deployment row into SIMS.
   *
   * @param {number} critterId
   * @param {string} deplyomentId
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterService
   */
  async upsertDeployment(critterId: number, deplyomentId: string): Promise<void> {
    return this.critterRepository.upsertDeployment(critterId, deplyomentId);
  }

  /**
   * Removes the deployment in SIMS.
   *
   * @param {number} critterId
   * @param {string} deploymentId the bctw deployment uuid
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterService
   */
  async removeDeployment(critterId: number, deploymentId: string): Promise<void> {
    return this.critterRepository.removeDeployment(critterId, deploymentId);
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
