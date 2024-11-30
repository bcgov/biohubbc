import { IDBConnection } from '../database/db';
import { TechniqueVantageRepository } from '../repositories/technique-vantage-repository';
import { VantagePostData } from '../repositories/vantage-mode-repository';
import { DBService } from './db-service';

/**
 * Service layer for technique vantage related information.
 *
 * @export
 * @class TechniqueVantageService
 * @extends {DBService}
 */
export class TechniqueVantageService extends DBService {
  techniqueVantageRepository: TechniqueVantageRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.techniqueVantageRepository = new TechniqueVantageRepository(connection);
  }

  /**
   * Insert vantage records for a technique.
   *
   * @param {number} methodTechniqueId
   * @param {VantagePostData[]} vantages
   * @return {*}  {(Promise<{ method_technique_vantage_mode_id: number }[] | undefined>)}
   * @memberof TechniqueVantageService
   */
  async insertVantagesForTechnique(
    methodTechniqueId: number,
    vantages: VantagePostData[]
  ): Promise<{ method_technique_vantage_mode_id: number }[] | undefined> {
    return this.techniqueVantageRepository.insertVantagesForTechnique(methodTechniqueId, vantages);
  }
}
