import { IDBConnection } from '../database/db';
import { AttractantRecord, AttractantRepository, IAttractantPostData } from '../repositories/attractants-repository';
import { DBService } from './db-service';

export class AttractantService extends DBService {
  attractantRepository: AttractantRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.attractantRepository = new AttractantRepository(connection);
  }

  /**
   * Get attractants for a technique id
   *
   * @param {number} techniqueId
   * @param {number} surveyId
   * @return {*}  {Promise<AttractantRecord[]>}
   * @memberof AttractantService
   */
  async getAttractantsByTechniqueId(techniqueId: number, surveyId: number): Promise<AttractantRecord[]> {
    return this.attractantRepository.getAttractantsByTechniqueId(techniqueId, surveyId);
  }

  /**
   * Insert attractants for a technique
   *
   * @param {IAttractantPostData[]} attractants
   * @param {number} surveyId
   * @return {*}  {Promise<void>}
   * @memberof AttractantService
   */
  async insertTechniqueAttractants(attractants: IAttractantPostData[], surveyId: number): Promise<void> {
    return this.attractantRepository.insertAttractantsForTechnique(surveyId, attractants);
  }

  /**
   * Update attractants for a technique
   *
   * @param {number} techniqueId
   * @param {IAttractantPostData[]} attractants
   * @param {number} surveyId
   * @return {*}  {Promise<void>}
   * @memberof AttractantService
   */
  async updateTechniqueAttractants(
    techniqueId: number,
    attractants: IAttractantPostData[],
    surveyId: number
  ): Promise<void> {
    // Get existing attractants associated with the technique
    const existingAttractants = await this.attractantRepository.getAttractantsByTechniqueId(techniqueId, surveyId);

    // Find existing attractants to delete
    const attractantsToDelete = existingAttractants.filter(
      (existing) => !attractants.some((incoming) => incoming.attractant_lookup_id === existing.attractant_lookup_id)
    );

    // Delete existing attractants that are not in the new list
    if (attractantsToDelete.length > 0) {
      const attractantIdsToDelete = attractantsToDelete.map((attractant) => attractant.attractant_lookup_id);
      await this.attractantRepository.deleteTechniqueAttractants(techniqueId, attractantIdsToDelete);
    }

    // If the incoming data does not yet exist in the DB, insert the record
    const attractantsForInsert = attractants.filter(
      (incoming) =>
        !existingAttractants.some((existing) => existing.attractant_lookup_id === incoming.attractant_lookup_id)
    );

    if (attractantsForInsert.length > 0) {
      await this.attractantRepository.insertAttractantsForTechnique(techniqueId, attractantsForInsert);
    }

    // If the incoming data already exists in the DB, do nothing
  }

  /**
   * Delete specific attractants for a technique
   *
   * @param {number} methodTechniqueId
   * @param {number[]} attractantLookupIds
   * @return {*}  {Promise<void>}
   * @memberof AttractantService
   */
  async deleteTechniqueAttractants(methodTechniqueId: number, attractantLookupIds: number[]): Promise<void> {
    await this.attractantRepository.deleteTechniqueAttractants(methodTechniqueId, attractantLookupIds);
  }

  /**
   * Delete all attractants for a technique
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<void>}
   * @memberof AttractantService
   */
  async deleteAllTechniqueAttractants(surveyId: number, methodTechniqueId: number): Promise<void> {
    await this.attractantRepository.deleteAllTechniqueAttractants(surveyId, methodTechniqueId);
  }
}
