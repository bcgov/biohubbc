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
   * Insert vantages for a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {VantagePostData[]} vantageMethods
   * @return {*}  {(Promise<{ method_technique_vantage_id: number }[] | undefined>)}
   * @memberof TechniqueVantageService
   */
  async insertVantagesForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    vantageMethods: VantagePostData[]
  ): Promise<{ method_technique_vantage_id: number }[] | undefined> {
    return this.techniqueVantageRepository.insertVantagesForTechnique(surveyId, methodTechniqueId, vantageMethods);
  }

  /**
   * Update vantages for a technique by inserting new vantages and
   * deleting existing vantages not included in the request.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {VantagePostData[]} vantageMethods
   * @return {*}  {(Promise<void>}
   * @memberof TechniqueVantageService
   */
  async updateVantagesForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    vantageMethods: VantagePostData[]
  ): Promise<void> {
    const existingVantages = await this.techniqueVantageRepository.getVantagesForTechnique(surveyId, methodTechniqueId);

    if (!existingVantages.length && !vantageMethods.length) return;

    // Map of existing vantages
    const existingVantagesMap = new Map(existingVantages.map((mode) => [mode.vantage_method_id, mode]));

    // Set of incoming vantages
    const incomingVantagesSet = new Set(vantageMethods.map((mode) => mode.vantage_method_id));

    // Determine which records need to be deleted (those that exist but are not in the incoming request)
    const vantagesToDelete = existingVantages
      .filter((existing) => !incomingVantagesSet.has(existing.vantage_method_id))
      .map((existing) => ({ vantage_method_id: existing.vantage_method_id }));

    // Determine which records need to be inserted (those in the incoming request but not in the existing ones)
    const vantagesToInsert = vantageMethods.filter((incoming) => !existingVantagesMap.has(incoming.vantage_method_id));

    const promises = [];

    if (vantagesToDelete.length) {
      promises.push(
        this.techniqueVantageRepository.deleteVantagesForTechnique(surveyId, methodTechniqueId, vantagesToDelete)
      );
    }

    if (vantagesToInsert.length) {
      promises.push(
        this.techniqueVantageRepository.insertVantagesForTechnique(surveyId, methodTechniqueId, vantagesToInsert)
      );
    }

    if (promises.length) {
      await Promise.all(promises);
    }
  }

  /**
   * Delete all vantages for a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<void>}
   * @memberof TechniqueVantageService
   */
  async deleteAllVantagesForTechnique(surveyId: number, methodTechniqueId: number): Promise<void> {
    await this.techniqueVantageRepository.deleteAllVantagesForTechnique(surveyId, methodTechniqueId);
  }
}
