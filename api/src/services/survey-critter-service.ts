import { IDBConnection } from '../database/db';
import { SurveyCritterRecord, SurveyCritterRepository } from '../repositories/survey-critter-repository';
import { DBService } from './db-service';

export class SurveyCritterService extends DBService {
  critterRepository: SurveyCritterRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.critterRepository = new SurveyCritterRepository(connection);
  }
  /**
   * Get all critter associations for the given survey. This only gets you critter ids, which can be used to fetch details from the external system.
   * @param {number} surveyId
   * @returns {*}
   */
  async getCrittersInSurvey(surveyId: number): Promise<SurveyCritterRecord[]> {
    return this.critterRepository.getCrittersInSurvey(surveyId);
  }

  /**
   * Add a critter as part of this survey. Does not create anything in the external system.
   *
   * @param {number} surveyId
   * @param {string} critterId
   * @returns {*}
   */
  async addCritterToSurvey(surveyId: number, critterBaseCritterId: string): Promise<number> {
    return this.critterRepository.addCritterToSurvey(surveyId, critterBaseCritterId);
  }

  /**
   * Removes a critter from the survey. Does not affect the critter in the external system.
   * @param {string} critterId
   * @returns {*}
   */
  async removeCritterFromSurvey(critterId: number): Promise<number> {
    return this.critterRepository.removeCritterFromSurvey(critterId);
  }

  /**
   * Upsert a deployment row into SIMS.
   *
   * @param {id} critterId
   * @param {id} deplyomentId
   * @returns {*}
   */
  async upsertDeployment(critterId: number, deplyomentId: string): Promise<number> {
    return this.critterRepository.upsertDeployment(critterId, deplyomentId);
  }

  /**
   * Removes the deployment in SIMS.
   *
   * @param {id} critterId
   * @param {string} deploymentId the bctw deployment uuid
   * @returns {*}
   */
  async removeDeployment(critterId: number, deploymentId: string): Promise<void> {
    return this.critterRepository.removeDeployment(critterId, deploymentId);
  }
}
