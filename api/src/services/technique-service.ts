import { IDBConnection } from '../database/db';
import {
  ITechniquePostData,
  IGetTechnique,
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
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof TechniqueService
   */
  async insertTechniquesForSurvey(
    surveyId: number,
    techniques: ITechniquePostData[]
  ): Promise<{ method_technique_id: number }[]> {
    
    // Insert technique rows
    const promises = techniques.map((technique) => {
      const rowForInsert: ITechniqueRowData = {
        name: technique.name,
        description: technique.description,
        method_lookup_id: technique.method_technique_id,
        distance_threshold: technique.distance_threshold,
        survey_id: technique.survey_id
      };
      return this.techniqueRepository.insertTechnique(rowForInsert, surveyId);
    });

    return Promise.all(promises);
  }
}
