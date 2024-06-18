import { IDBConnection } from '../database/db';
import { SurveyCritterRecord, SurveyCritterRepository } from '../repositories/survey-critter-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
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

  constructor(connection: IDBConnection) {
    super(connection);

    this.critterRepository = new SurveyCritterRepository(connection);
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
   * Retrieves all critters that are available to the user, based on their permissions.
   *
   * Note: SIMS does not store critter information, beyond an ID. Critter details must be fetched from the external
   * CritterBase API.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveyCritterRecord[]>}
   * @memberof SurveyCritterService
   */
  async findCritters(
    isUserAdmin: boolean,
    systemUserId: number | null,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyCritterRecord[]> {
    return this.critterRepository.findCritters(isUserAdmin, systemUserId, pagination);
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
    return this.critterRepository.addCritterToSurvey(surveyId, critterBaseCritterId);
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
}
