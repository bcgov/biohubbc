import { IDBConnection } from '../database/db';
import { AttractantRecord, AttractantRepository, IAttractantPostData } from '../repositories/attractants-repository';
import { DBService } from './db-service';

/**
 * Attractant service.
 *
 * Handles all business logic related to technique attractants.
 *
 * @export
 * @class AttractantService
 * @extends {DBService}
 */
export class AttractantService extends DBService {
  attractantRepository: AttractantRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.attractantRepository = new AttractantRepository(connection);
  }

  /**
   * Get all attractants for a technique.
   *
   * @param {number} surveyId The ID of the survey the technique is associated with
   * @param {number} methodTechniqueId The ID of the technique to get attractants for
   * @return {*}  {Promise<AttractantRecord[]>}
   * @memberof AttractantService
   */
  async getAttractantsByTechniqueId(surveyId: number, methodTechniqueId: number): Promise<AttractantRecord[]> {
    return this.attractantRepository.getAttractantsByTechniqueId(surveyId, methodTechniqueId);
  }

  /**
   * Insert attractant records for a technique.
   *
   * @param {number} surveyId The ID of the survey the technique is associated with
   * @param {number} methodTechniqueId The ID of the technique to insert attractants for
   * @param {IAttractantPostData[]} attractants The attractants to insert
   * @return {*}  {Promise<{ method_technique_attractant_id: number }[]>}
   * @memberof AttractantService
   */
  async insertTechniqueAttractants(
    surveyId: number,
    methodTechniqueId: number,
    attractants: IAttractantPostData[]
  ): Promise<{ method_technique_attractant_id: number }[]> {
    return this.attractantRepository.insertAttractantsForTechnique(surveyId, methodTechniqueId, attractants);
  }

  /**
   * Update attractant records for a technique.
   *
   * @param {number} surveyId The ID of the survey the technique is associated with
   * @param {number} methodTechniqueId The ID of the technique to update attractants for
   * @param {IAttractantPostData[]} attractants The attractants to update
   * @return {*}  {Promise<void>}
   * @memberof AttractantService
   */
  async updateTechniqueAttractants(
    surveyId: number,
    methodTechniqueId: number,
    attractants: IAttractantPostData[]
  ): Promise<void> {
    // Get existing attractants associated with the technique
    const existingAttractants = await this.attractantRepository.getAttractantsByTechniqueId(
      surveyId,
      methodTechniqueId
    );

    // Find existing attractants to delete
    const attractantsToDelete = existingAttractants.filter(
      (existing) => !attractants.some((incoming) => incoming.attractant_lookup_id === existing.attractant_lookup_id)
    );

    // Delete existing attractants that are not in the new list
    if (attractantsToDelete.length > 0) {
      const attractantIdsToDelete = attractantsToDelete.map((attractant) => attractant.attractant_lookup_id);
      await this.attractantRepository.deleteTechniqueAttractants(surveyId, methodTechniqueId, attractantIdsToDelete);
    }

    // If the incoming data does not yet exist in the DB, insert the record
    const attractantsToInsert = attractants.filter(
      (incoming) =>
        !existingAttractants.some((existing) => existing.attractant_lookup_id === incoming.attractant_lookup_id)
    );

    if (attractantsToInsert.length > 0) {
      await this.attractantRepository.insertAttractantsForTechnique(surveyId, methodTechniqueId, attractantsToInsert);
    }
  }

  /**
   * Delete some attractants for a technique.
   *
   * @param {number} surveyId The ID of the survey the technique is associated with
   * @param {number} methodTechniqueId The ID of the technique to delete attractants for
   * @param {number[]} attractantLookupIds The IDs of the attractants to delete
   * @return {*}  {Promise<void>}
   * @memberof AttractantService
   */
  async deleteTechniqueAttractants(
    surveyId: number,
    methodTechniqueId: number,
    attractantLookupIds: number[]
  ): Promise<void> {
    await this.attractantRepository.deleteTechniqueAttractants(surveyId, methodTechniqueId, attractantLookupIds);
  }

  /**
   * Delete all attractants for a technique.
   *
   * @param {number} surveyId The ID of the survey the technique is associated with
   * @param {number} methodTechniqueId The ID of the technique to delete attractants for
   * @return {*}  {Promise<void>}
   * @memberof AttractantService
   */
  async deleteAllTechniqueAttractants(surveyId: number, methodTechniqueId: number): Promise<void> {
    await this.attractantRepository.deleteAllTechniqueAttractants(surveyId, methodTechniqueId);
  }
}
