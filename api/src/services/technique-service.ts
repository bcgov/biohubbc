import { IDBConnection } from '../database/db';
import {
  IGetTechnique,
  IGetTechniqueAttributes,
  ITechniquePostData,
  ITechniqueRowData,
  TechniqueRepository
} from '../repositories/technique-repository';
import { DBService } from './db-service';

export class TechniqueService extends DBService {
  techniqueRepository: TechniqueRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.techniqueRepository = new TechniqueRepository(connection);
  }

  /**
   * Get techniques for a survey ID
   *
   * @param {number} surveyId
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async getTechniquesForSurveyId(surveyId: number): Promise<IGetTechnique[]> {
    return this.techniqueRepository.getTechniquesForSurveyId(surveyId);
  }

  /**
   * Get count of techniques for a survey ID
   *
   * @param {number} surveyId
   * @param
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async getTechniquesCountForSurveyId(surveyId: number): Promise<number> {
    return this.techniqueRepository.getTechniquesCountForSurveyId(surveyId);
  }

  /**
   * Insert techniques for a survey
   *
   * @param {number} surveyId
   * @param {ITechniquePostData[]} techniques
   * @returns {Promise<(ITechniquePostData & { method_technique_id: number })[]>}
   * @memberof TechniqueService
   */
  async insertTechniquesForSurvey(
    surveyId: number,
    techniques: ITechniquePostData[]
  ): Promise<(ITechniquePostData & { method_technique_id: number })[]> {
    // Insert technique rows
    const promises = techniques.map(async (technique) => {
      const rowForInsert: ITechniqueRowData = {
        name: technique.name,
        description: technique.description,
        method_lookup_id: technique.method_lookup_id,
        distance_threshold: technique.distance_threshold,
        survey_id: surveyId
      };

      const { method_technique_id } = await this.techniqueRepository.insertTechnique(rowForInsert, surveyId);

      return { ...technique, method_technique_id };
    });

    return Promise.all(promises);
  }

  /**
   * Insert attractants for a technique
   *
   * @param {number} methodTechniqueId
   * @param {number[]} attractantLookupIds
   * @param {number} surveyId
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async insertTechniqueAttractants(
    methodTechniqueId: number,
    attractantLookupIds: number[],
    surveyId: number
  ): Promise<void> {
    return this.techniqueRepository.insertAttractantsForTechnique(methodTechniqueId, attractantLookupIds, surveyId);
  }

  /**
   * Get quantitative and qualitative attributes for a method lookup Id
   *
   * @param {number[]} method_lookup_ids
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async getAttributesForMethodLookupIds(method_lookup_ids: number[]): Promise<IGetTechniqueAttributes[]> {
    return this.techniqueRepository.getAttributesForMethodLookupIds(method_lookup_ids);
  }
}
