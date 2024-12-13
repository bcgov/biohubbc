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
   * Insert vantage modes for a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {VantagePostData[]} vantageModeMethods
   * @return {*}  {(Promise<{ method_technique_vantage_mode_id: number }[] | undefined>)}
   * @memberof TechniqueVantageService
   */
  async insertVantageModesForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    vantageModeMethods: VantagePostData[]
  ): Promise<{ method_technique_vantage_mode_id: number }[] | undefined> {
    return this.techniqueVantageRepository.insertVantageModesForTechnique(
      surveyId,
      methodTechniqueId,
      vantageModeMethods
    );
  }

  /**
   * Update vantage modes for a technique by inserting new vantage modes and
   * deleting existing vantage modes not included in the request.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {VantagePostData[]} vantageModeMethods
   * @return {*}  {(Promise<void>}
   * @memberof TechniqueVantageService
   */
  async updateVantageModesForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    vantageModeMethods: VantagePostData[]
  ): Promise<void> {
    const existingVantageModes = await this.techniqueVantageRepository.getVantageModesForTechnique(
      surveyId,
      methodTechniqueId
    );

    if (!existingVantageModes.length && !vantageModeMethods.length) return;

    // Map of existing vantage modes
    const existingVantageModesMap = new Map(existingVantageModes.map((mode) => [mode.vantage_mode_method_id, mode]));

    // Set of incoming vantage modes
    const incomingVantageModesSet = new Set(vantageModeMethods.map((mode) => mode.vantage_mode_method_id));

    // Determine which records need to be deleted (those that exist but are not in the incoming request)
    const vantageModesToDelete = existingVantageModes
      .filter((existing) => !incomingVantageModesSet.has(existing.vantage_mode_method_id))
      .map((existing) => ({ vantage_mode_method_id: existing.vantage_mode_method_id }));

    // Determine which records need to be inserted (those in the incoming request but not in the existing ones)
    const vantageModesToInsert = vantageModeMethods.filter(
      (incoming) => !existingVantageModesMap.has(incoming.vantage_mode_method_id)
    );

    const promises = [];

    if (vantageModesToDelete.length) {
      promises.push(
        this.techniqueVantageRepository.deleteVantageModesForTechnique(
          surveyId,
          methodTechniqueId,
          vantageModesToDelete
        )
      );
    }

    if (vantageModesToInsert.length) {
      promises.push(
        this.techniqueVantageRepository.insertVantageModesForTechnique(
          surveyId,
          methodTechniqueId,
          vantageModesToInsert
        )
      );
    }

    if (promises.length) {
      await Promise.all(promises);
    }
  }

  /**
   * Delete all vantage modes for a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<void>}
   * @memberof TechniqueVantageService
   */
  async deleteAllVantageModesForTechnique(surveyId: number, methodTechniqueId: number): Promise<void> {
    await this.techniqueVantageRepository.deleteAllVantageModesForTechnique(surveyId, methodTechniqueId);
  }
}
