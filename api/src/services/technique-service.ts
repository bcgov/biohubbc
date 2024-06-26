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
   * Get a technique by id.
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
   * Get all technique records for a survey.
   *
   * @param {number} surveyId
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async getTechniquesForSurveyId(surveyId: number): Promise<IGetTechnique[]> {
    return this.techniqueRepository.getTechniquesForSurveyId(surveyId);
  }

  /**
   * Get the count of all technique records for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof TechniqueService
   */
  async getTechniquesCountForSurveyId(surveyId: number): Promise<number> {
    return this.techniqueRepository.getTechniquesCountForSurveyId(surveyId);
  }

  /**
   * Insert technique records.
   *
   * @param {number} surveyId
   * @param {ITechniquePostData[]} techniques
   * @return {*}  {(Promise<(ITechniquePostData & { method_technique_id: number })[]>)}
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

      const { method_technique_id } = await this.techniqueRepository.insertTechnique(surveyId, rowForInsert);

      return { ...technique, method_technique_id };
    });

    return Promise.all(promises);
  }

  /**
   * Update a technique record.
   *
   * @param {number} surveyId
   * @param {number} techniqueId
   * @param {ITechniqueRowDataForInsert} technique
   * @return {*}  {Promise<void>}
   * @memberof TechniqueService
   */
  async updateTechnique(surveyId: number, techniqueId: number, technique: ITechniqueRowDataForInsert): Promise<void> {
    return this.techniqueRepository.updateTechnique(surveyId, technique, techniqueId);
  }

  /**
   * Delete a technique record.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<number>}
   * @memberof TechniqueService
   */
  async deleteTechnique(surveyId: number, methodTechniqueId: number): Promise<number> {
    // Delete any attributes on the technique
    await this.attractantService.deleteAllTechniqueAttractants(surveyId, methodTechniqueId);

    return this.techniqueRepository.deleteTechnique(surveyId, methodTechniqueId);
  }
}
