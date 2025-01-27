import { IDBConnection } from '../database/db';
import { ApiConflictError } from '../errors/api-error';
import { ITechniqueAdvancedFilters } from '../models/technique-view';
import {
  FindTechniqueRecord,
  ITechniquePostData,
  ITechniqueRowDataForInsert,
  ITechniqueRowDataForUpdate,
  TechniqueObject,
  TechniqueRepository
} from '../repositories/technique-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { AttractantService } from './attractants-service';
import { DBService } from './db-service';
import { SamplePeriodService } from './sample-period-service';
import { TechniqueAttributeService } from './technique-attributes-service';
import { TechniqueVantageService } from './technique-vantage-service';

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
  techniqueVantageService: TechniqueVantageService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.techniqueRepository = new TechniqueRepository(connection);
    this.attractantService = new AttractantService(connection);
    this.techniqueAttributeService = new TechniqueAttributeService(connection);
    this.techniqueVantageService = new TechniqueVantageService(connection);
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
   * Retrieves the paginated list of all techniques that are available to the user, based on their permissions and
   * provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ITechniqueAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<FindTechniqueRecord[]>}
   * @memberof TechniqueService
   */
  async findTechniques(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ITechniqueAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindTechniqueRecord[]> {
    return this.techniqueRepository.findTechniques(isUserAdmin, systemUserId, filterFields, pagination);
  }

  /**
   * Retrieves the count of all techniques that are available to the user, based on their permissions and
   * provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ITechniqueAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof TechniqueService
   */
  async findTechniquesCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ITechniqueAdvancedFilters
  ): Promise<number> {
    return this.techniqueRepository.findTechniquesCount(isUserAdmin, systemUserId, filterFields);
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
        distance_threshold: technique.distance_threshold,
        method_response_metric_id: technique.method_response_metric_id
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

      // Insert vantages
      if (technique.vantage_methods.length) {
        promises.push(
          this.techniqueVantageService.insertVantagesForTechnique(
            surveyId,
            method_technique_id,
            technique.vantage_methods
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
    // Do not allow the technique to be deleted if it is associated to any survey sample period records.
    const samplePeriodService = new SamplePeriodService(this.connection);
    await samplePeriodService
      .findSamplePeriodsCount(false, this.connection.systemUserId(), {
        method_technique_id: [methodTechniqueId],
        survey_id: surveyId
      })
      .then((count) => {
        if (count !== 0) {
          throw new ApiConflictError('Cannot delete a technique that is associated to a survey sample period.');
        }
      });

    // Delete any attractants on the technique
    await this.attractantService.deleteAllTechniqueAttractants(surveyId, methodTechniqueId);

    // Delete any attributes on the technique
    await this.techniqueAttributeService.deleteAllTechniqueAttributes(surveyId, methodTechniqueId);

    // Delete any vantages on the technique
    await this.techniqueVantageService.deleteAllVantagesForTechnique(surveyId, methodTechniqueId);

    // Delete the technique
    return this.techniqueRepository.deleteTechnique(surveyId, methodTechniqueId);
  }

  /**
   * Delete multiple technique records.
   *
   * @param {number} surveyId
   * @param {number[]} methodTechniqueIds
   * @return {*}  {Promise<void>}
   * @memberof TechniqueService
   */
  async deleteTechniques(surveyId: number, methodTechniqueIds: number[]): Promise<void> {
    // Delete each technique record
    // TODO: Possible to optimize this to delete all records in a single query?
    await Promise.all(
      methodTechniqueIds.map(async (methodTechniqueId) => this.deleteTechnique(surveyId, methodTechniqueId))
    );
  }
}
