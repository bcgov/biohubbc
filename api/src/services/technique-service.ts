import { IDBConnection } from '../database/db';
import {
  ITechniquePostData,
  ITechniqueRowDataForInsert,
  ITechniqueRowDataForUpdate,
  TechniqueObject,
  TechniqueRepository
} from '../repositories/technique-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { AttractantService } from './attractants-service';
import { DBService } from './db-service';
import { TechniqueAttributeService } from './technique-attributes-service';

/**
 * Service layer for techniques.
 *
 * @export
 * @class TechniqueService
 * @extends {DBService}
 */
export class TechniqueService extends DBService {
  techniqueRepository: TechniqueRepository;
  attractantService: AttractantService;
  techniqueAttributeService: TechniqueAttributeService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.techniqueRepository = new TechniqueRepository(connection);
    this.attractantService = new AttractantService(connection);
    this.techniqueAttributeService = new TechniqueAttributeService(connection);
  }

  /**
   * Get a technique by id.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<TechniqueObject>}
   * @memberof TechniqueService
   */
  async getTechniqueById(surveyId: number, methodTechniqueId: number): Promise<TechniqueObject> {
    return this.techniqueRepository.getTechniqueById(surveyId, methodTechniqueId);
  }

  /**
   * Get a paginated list of technique records for a survey.
   *
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<TechniqueObject[]>}
   * @memberof TechniqueService
   */
  async getTechniquesForSurveyId(surveyId: number, pagination?: ApiPaginationOptions): Promise<TechniqueObject[]> {
    return this.techniqueRepository.getTechniquesForSurveyId(surveyId, pagination);
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
   * @return {*}  {Promise<{ method_technique_id: number }[]>}
   * @memberof TechniqueService
   */
  async insertTechniquesForSurvey(
    surveyId: number,
    techniques: ITechniquePostData[]
  ): Promise<{ method_technique_id: number }[]> {
    // Insert each technique record
    const promises = techniques.map(async (technique) => {
      const rowForInsert: ITechniqueRowDataForInsert = {
        name: technique.name,
        description: technique.description,
        method_lookup_id: technique.method_lookup_id,
        distance_threshold: technique.distance_threshold
      };

      // Insert root technique record
      const { method_technique_id } = await this.techniqueRepository.insertTechnique(surveyId, rowForInsert);

      const promises = [];

      // Insert attractants
      if (technique.attractants.length) {
        promises.push(
          this.attractantService.insertTechniqueAttractants(surveyId, method_technique_id, technique.attractants)
        );
      }

      // Insert qualitative attributes
      if (technique.attributes.qualitative_attributes.length) {
        promises.push(
          this.techniqueAttributeService.insertQualitativeAttributesForTechnique(
            method_technique_id,
            technique.attributes.qualitative_attributes
          )
        );
      }

      // Insert quantitative attributes
      if (technique.attributes.quantitative_attributes.length) {
        promises.push(
          this.techniqueAttributeService.insertQuantitativeAttributesForTechnique(
            method_technique_id,
            technique.attributes.quantitative_attributes
          )
        );
      }

      await Promise.all(promises);

      return { method_technique_id };
    });

    return Promise.all(promises);
  }

  /**
   * Update a technique record.
   *
   * @param {number} surveyId
   * @param {ITechniqueRowDataForUpdate} technique
   * @return {*}  {Promise<{ method_technique_id: number }>}
   * @memberof TechniqueService
   */
  async updateTechnique(
    surveyId: number,
    technique: ITechniqueRowDataForUpdate
  ): Promise<{ method_technique_id: number }> {
    return this.techniqueRepository.updateTechnique(surveyId, technique);
  }

  /**
   * Delete a technique record.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<{ method_technique_id: number }>}
   * @memberof TechniqueService
   */
  async deleteTechnique(surveyId: number, methodTechniqueId: number): Promise<{ method_technique_id: number }> {
    // Delete any attractants on the technique
    await this.attractantService.deleteAllTechniqueAttractants(surveyId, methodTechniqueId);

    // Delete any attributes on the technique
    await this.techniqueAttributeService.deleteAllTechniqueAttributes(surveyId, methodTechniqueId);

    // Delete the technique
    return this.techniqueRepository.deleteTechnique(surveyId, methodTechniqueId);
  }
}
