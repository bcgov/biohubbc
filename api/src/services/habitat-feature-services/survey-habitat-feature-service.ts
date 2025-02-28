import { IDBConnection } from '../../database/db';
import { FindHabitatFeatureDefinitions } from '../../repositories/habitat-feature-repository/habitat-feature-repository.interface';
import { SurveyHabitatFeatureRepository } from '../../repositories/habitat-feature-repository/survey-habitat-feature-repository';
import {
  InsertSurveyHabitatFeature,
  SurveyHabitatFeaturesWithSupplementaryData,
  SurveyHabitatFeatureWithTaxons
} from '../../repositories/habitat-feature-repository/survey-habitat-feature-repository.interface';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { DBService } from '../db-service';
import { HabitatFeatureService } from './habitat-feature-service';

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
   * @memberof ObservationService
   */
  async getSurveyHabitatFeaturesWithSupplementaryData(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyHabitatFeaturesWithSupplementaryData> {
    const [surveyHabitatFeatures, surveyHabitatFeaturesCount, surveyHabitatFeatureTypeDefinitions] = await Promise.all([
      // Fetch observations
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
        habitatFeatureQuantitativeDefinition: surveyHabitatFeatureTypeDefinitions.habitatFeatureQuantitativeDefinition,
        habitatFeatureQualitativeDefinition: surveyHabitatFeatureTypeDefinitions.habitatFeatureQualitativeDefinition
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
}
