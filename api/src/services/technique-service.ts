import { IDBConnection } from '../database/db';
import {
  IGetTechnique,
  ITechniquePostData,
  ITechniqueRowDataForInsert,
  TechniqueRepository
} from '../repositories/technique-repository';
import { AttractantService } from './attractants-service';
import { DBService } from './db-service';

export class TechniqueService extends DBService {
  techniqueRepository: TechniqueRepository;
  attractantService: AttractantService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.techniqueRepository = new TechniqueRepository(connection);
    this.attractantService = new AttractantService(connection);
  }

  /**
   * Get a technique by Id
   *
   * @param {number} surveyId
   * @param {number} techniqueId
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async getTechniqueById(surveyId: number, techniqueId: number): Promise<IGetTechnique> {
    return this.techniqueRepository.getTechniqueById(surveyId, techniqueId);
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
    const promises = techniques.map(async (technique) => {
      const rowForInsert: ITechniqueRowDataForInsert = {
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
   * Update technique in a Survey
   *
   * @param {number} surveyId
   * @param {number} techniqueId
   * @param {ITechniqueRowDataForInsert} technique
   * @returns {*}
   * @memberof TechniqueService
   */
  async updateTechnique(surveyId: number, techniqueId: number, technique: ITechniqueRowDataForInsert): Promise<void> {
    return this.techniqueRepository.updateTechnique(technique, techniqueId, surveyId);
  }

  /**
   * Delete a technique from a Survey
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async deleteTechnique(surveyId: number, methodTechniqueId: number): Promise<number> {
    // Delete any attributes on the technique
    await this.attractantService.deleteAllTechniqueAttractants(surveyId, methodTechniqueId);

    const technique = await this.techniqueRepository.deleteTechnique(surveyId, methodTechniqueId);

    return technique;
  }
}
