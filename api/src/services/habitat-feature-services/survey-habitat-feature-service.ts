import { IDBConnection } from '../../database/db';
import { FindHabitatFeatureDefinitions } from '../../repositories/habitat-feature-repository/habitat-feature-repository.interface';
import { SurveyHabitatFeatureRepository } from '../../repositories/habitat-feature-repository/survey-habitat-feature-repository';
import {
  FindSurveyHabitatFeatureAdvancedFilters,
  InsertSurveyHabitatFeature,
  SurveyHabitatFeaturesWithSupplementaryData,
  SurveyHabitatFeatureWithTaxons,
  UpdateSurveyHabitatFeature
} from '../../repositories/habitat-feature-repository/survey-habitat-feature-repository.interface';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { DBService } from '../db-service';
import { HabitatFeatureService } from './habitat-feature-service';

/**
 * Service class for working with survey habitat feature records.
 *
 * @export
 * @class SurveyHabitatFeatureService
 * @extends {DBService}
 */
export class SurveyHabitatFeatureService extends DBService {
  surveyHabitatFeatureRepository: SurveyHabitatFeatureRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.surveyHabitatFeatureRepository = new SurveyHabitatFeatureRepository(connection);
  }

  async insertSurveyHabitatFeatures(surveyId: number, habitatFeatures: InsertSurveyHabitatFeature[]): Promise<void> {
    this.surveyHabitatFeatureRepository.insertSurveyHabitatFeatures(surveyId, habitatFeatures);
  }

  /**
   * Update an existing survey habitat feature record, for a survey.
   *
   * @param {number} surveyId
   * @param {number} surveyHabitatFeatureId
   * @param {UpdateSurveyHabitatFeature} habitatFeature
   * @return {*}  {Promise<void>}
   * @memberof SurveyHabitatFeatureService
   */
  async updateSurveyHabitatFeature(
    surveyId: number,
    surveyHabitatFeatureId: number,
    habitatFeature: UpdateSurveyHabitatFeature
  ): Promise<void> {
    this.surveyHabitatFeatureRepository.updateSurveyHabitatFeature(surveyId, surveyHabitatFeatureId, habitatFeature);
  }

  /**
   * Get a single survey habitat feature record.
   *
   * @param {number} surveyId
   * @param {number} surveyHabitatFeatureId
   * @return {*}  {Promise<SurveyHabitatFeatureWithTaxons[]>}
   * @memberof SurveyHabitatFeatureService
   */
  async getSurveyHabitatFeature(
    surveyId: number,
    surveyHabitatFeatureId: number
  ): Promise<SurveyHabitatFeatureWithTaxons> {
    return this.surveyHabitatFeatureRepository.getSurveyHabitatFeature(surveyId, surveyHabitatFeatureId);
  }

  /**
   * Get paginated habitat features for a survey.
   *
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveyHabitatFeatureWithTaxons[]>}
   * @memberof SurveyHabitatFeatureService
   */
  async getSurveyHabitatFeatures(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyHabitatFeatureWithTaxons[]> {
    return this.surveyHabitatFeatureRepository.getSurveyHabitatFeatures(surveyId, pagination);
  }

  /**
   * Get the total count of habitat features for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof SurveyHabitatFeatureService
   */
  async getSurveyHabitatFeaturesCount(surveyId: number): Promise<number> {
    return this.surveyHabitatFeatureRepository.getSurveyHabitatFeaturesCount(surveyId);
  }

  /**
   * Get paginated survey habitat feature records, with supplementary data, for a survey.
   *
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveyHabitatFeaturesWithSupplementaryData>}
   * @memberof SurveyHabitatFeatureService
   */
  async getSurveyHabitatFeaturesWithSupplementaryData(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyHabitatFeaturesWithSupplementaryData> {
    const [surveyHabitatFeatures, surveyHabitatFeaturesCount, surveyHabitatFeatureTypeDefinitions] = await Promise.all([
      // Fetch survey habitat feature records
      this.getSurveyHabitatFeatures(surveyId, pagination),
      // Fetch pagination count data
      this.getSurveyHabitatFeaturesCount(surveyId),
      // Fetch habitat feature definitions applicable to this survey
      this.getSurveyHabitatFeatureDefinitions(surveyId)
    ]);

    return {
      surveyHabitatFeatures: surveyHabitatFeatures,
      supplementaryData: {
        count: surveyHabitatFeaturesCount,
        habitatFeatureQuantitativeDefinitions:
          surveyHabitatFeatureTypeDefinitions.habitatFeatureQuantitativeDefinitions,
        habitatFeatureQualitativeDefinitions: surveyHabitatFeatureTypeDefinitions.habitatFeatureQualitativeDefinitions
      }
    };
  }

  /**
   * Get habitat feature definitions for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<FindHabitatFeatureDefinitions>}
   * @memberof SurveyHabitatFeatureService
   */
  async getSurveyHabitatFeatureDefinitions(surveyId: number): Promise<FindHabitatFeatureDefinitions> {
    const habitatFeatureService = new HabitatFeatureService(this.connection);

    return habitatFeatureService.findHabitatFeatureDefinitions({ survey_id: surveyId });
  }

  /**
   * Get survey habitat features for the current user, based on their permissions and filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {number} systemUserId
   * @param {FindSurveyHabitatFeatureAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveyHabitatFeatureWithTaxons[]>}
   * @memberof SurveyHabitatFeatureService
   */
  async findSurveyHabitatFeatures(
    isUserAdmin: boolean,
    systemUserId: number,
    filterFields: FindSurveyHabitatFeatureAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyHabitatFeatureWithTaxons[]> {
    return this.surveyHabitatFeatureRepository.findSurveyHabitatFeatures(
      isUserAdmin,
      systemUserId,
      filterFields,
      pagination
    );
  }

  /**
   * Get the total count of survey habitat features for the current user, based on their permissions and filter
   * criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {number} systemUserId
   * @param {FindSurveyHabitatFeatureAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof SurveyHabitatFeatureService
   */
  async findSurveyHabitatFeaturesCount(
    isUserAdmin: boolean,
    systemUserId: number,
    filterFields: FindSurveyHabitatFeatureAdvancedFilters
  ): Promise<number> {
    return this.surveyHabitatFeatureRepository.findSurveyHabitatFeaturesCount(isUserAdmin, systemUserId, filterFields);
  }

  /**
   * Delete an existing survey habitat feature record, for a survey.
   *
   * @param {number} surveyId
   * @param {number} surveyHabitatFeatureId
   * @return {*}  {Promise<void>}
   * @memberof SurveyHabitatFeatureService
   */
  async deleteSurveyHabitatFeature(surveyId: number, surveyHabitatFeatureId: number): Promise<void> {
    this.deleteSurveyHabitatFeatures(surveyId, [surveyHabitatFeatureId]);
  }

  /**
   * Delete an existing survey habitat feature record, for a survey.
   *
   * @param {number} surveyId
   * @param {number} surveyHabitatFeatureIds
   * @return {*}  {Promise<void>}
   * @memberof SurveyHabitatFeatureService
   */
  async deleteSurveyHabitatFeatures(surveyId: number, surveyHabitatFeatureIds: number[]): Promise<void> {
    this.surveyHabitatFeatureRepository.deleteSurveyHabitatFeatures(surveyId, surveyHabitatFeatureIds);
  }
}
