import { IDBConnection } from '../database/db';
import { SubCountCritterRepository } from '../repositories/subcount-critter-repository';
import { DBService } from './db-service';

export class SubcountCritterService extends DBService {
  subCountCritterRepository: SubCountCritterRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.subCountCritterRepository = new SubCountCritterRepository(connection);
  }

  /**
   * Delete subcount_critter records for the given set of observation subcount ids.
   *
   * @param {number} surveyId
   * @param {number[]} observationSubcountIds
   * @return {*}  {Promise<void>}
   * @memberof SubcountCritterService
   */
  async deleteSubcountCrittersByObservationSubcountId(
    surveyId: number,
    observationSubcountIds: number[]
  ): Promise<void> {
    return this.subCountCritterRepository.deleteSubcountCrittersByObservationSubcountId(
      surveyId,
      observationSubcountIds
    );
  }
}
