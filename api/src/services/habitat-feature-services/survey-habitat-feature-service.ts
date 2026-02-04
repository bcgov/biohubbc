import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { FindHabitatFeatureDefinitions } from '../../repositories/habitat-feature-repository/habitat-feature-repository.interface';
import { SurveyHabitatFeatureRepository } from '../../repositories/habitat-feature-repository/survey-habitat-feature-repository';
import {
  FindSurveyHabitatFeatureAdvancedFilters,
  InsertSurveyHabitatFeature,
  InsertSurveyHabitatFeatureTaxon,
  SurveyHabitatFeaturesGeometryWithSupplementaryData,
  SurveyHabitatFeaturesWithSupplementaryData,
  SurveyHabitatFeatureWithSupplementaryData,
  SurveyHabitatFeatureWithTaxonsAndSampling,
  UpdateSurveyHabitatFeature
} from '../../repositories/habitat-feature-repository/survey-habitat-feature-repository.interface';
import { getLogger } from '../../utils/logger';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { DBService } from '../db-service';
import { PlatformService } from '../platform-service';
import { SamplePeriodService } from '../sample-period-service';
import { HabitatFeatureService } from './habitat-feature-service';

const defaultLog = getLogger('survey-habitat-feature-service');

/**
 * Service class for working with survey habitat feature records.
 *
 * @export
 * @class SurveyHabitatFeatureService
 * @extends {DBService}
 */
export class SurveyHabitatFeatureService extends DBService {
  surveyHabitatFeatureRepository: SurveyHabitatFeatureRepository;
  platformService: PlatformService;
  samplePeriodService: SamplePeriodService;

  constructor(connection: IDBConnection) {
    super(connection);
    this.surveyHabitatFeatureRepository = new SurveyHabitatFeatureRepository(connection);
    this.platformService = new PlatformService(connection);
    this.samplePeriodService = new SamplePeriodService(connection);
  }

  /**
   * Insert new survey habitat feature records, for a survey.
   *
   * Note: This method will validate the taxon TSNs are valid before inserting the records.
   *
   * @param {number} surveyId
   * @param {InsertSurveyHabitatFeature[]} surveyHabitatFeatures
   * @return {*} {Promise<void>}
   * @throws {ApiGeneralError} - If Taxon TSNs are invalid, or fail to be validated
   * @memberof SurveyHabitatFeatureService
   */
  async insertSurveyHabitatFeatures(
    surveyId: number,
    surveyHabitatFeatures: InsertSurveyHabitatFeature[]
  ): Promise<void> {
    const taxonsAreValid = await this._validateSurveyHabitatFeaturesTsns(surveyHabitatFeatures);

    if (!taxonsAreValid) {
      throw new ApiGeneralError('Invalid taxon TSNs provided', [
        'SurveyHabitatFeatureService->insertSurveyHabitatFeatures'
      ]);
    }

    Promise.all(
      surveyHabitatFeatures.map((surveyHabitatFeature) =>
        this.surveyHabitatFeatureRepository.insertSurveyHabitatFeature(surveyId, surveyHabitatFeature)
      )
    );
  }

  /**
   * Update an existing survey habitat feature record, for a survey.
   *
   * Note: This method will validate the taxon TSNs are valid before inserting the records.
   *
   * @param {number} surveyId
   * @param {number} surveyHabitatFeatureId
   * @param {UpdateSurveyHabitatFeature} surveyHabitatFeature
   * @return {*}  {Promise<void>}
   * @throws {ApiGeneralError} - If Taxon TSNs are invalid, or fail to be validated
   * @memberof SurveyHabitatFeatureService
   */
  async updateSurveyHabitatFeature(
    surveyId: number,
    surveyHabitatFeatureId: number,
    surveyHabitatFeature: UpdateSurveyHabitatFeature
  ): Promise<void> {
    const taxonsAreValid = await this._validateSurveyHabitatFeaturesTsns([surveyHabitatFeature]);

    if (!taxonsAreValid) {
      throw new ApiGeneralError('Invalid taxon TSNs provided', [
        'SurveyHabitatFeatureService->updateSurveyHabitatFeature'
      ]);
    }

    this.surveyHabitatFeatureRepository.updateSurveyHabitatFeature(
      surveyId,
      surveyHabitatFeatureId,
      surveyHabitatFeature
    );
  }

  /**
   * Get an existing survey habitat feature record.
   *
   * @param {number} surveyId
   * @param {number} surveyHabitatFeatureId
   * @return {*}  {Promise<SurveyHabitatFeatureWithSupplementaryData>}
   * @memberof SurveyHabitatFeatureService
   */
  async getSurveyHabitatFeature(
    surveyId: number,
    surveyHabitatFeatureId: number
  ): Promise<SurveyHabitatFeatureWithSupplementaryData> {
    const [surveyHabitatFeature, surveyHabitatFeatureTypeDefinitions] = await Promise.all([
      // Fetch survey habitat feature records
      this.surveyHabitatFeatureRepository.getSurveyHabitatFeature(surveyId, surveyHabitatFeatureId),
      // Fetch habitat feature definitions applicable to this survey
      this.getSurveyHabitatFeatureDefinitions(surveyId)
    ]);

    const samplePeriods = await this.samplePeriodService.getSamplePeriodsForSurvey(surveyId);

    return {
      surveyHabitatFeature: surveyHabitatFeature,
      supplementaryData: {
        count: 1,
        sampling_periods: samplePeriods,
        habitatFeatureQuantitativeDefinitions:
          surveyHabitatFeatureTypeDefinitions.habitatFeatureQuantitativeDefinitions,
        habitatFeatureQualitativeDefinitions: surveyHabitatFeatureTypeDefinitions.habitatFeatureQualitativeDefinitions
      }
    };
  }

  /**
   * Get paginated habitat features for a survey.
   *
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveyHabitatFeatureWithTaxonsAndSampling[]>}
   * @memberof SurveyHabitatFeatureService
   */
  async getSurveyHabitatFeatures(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyHabitatFeatureWithTaxonsAndSampling[]> {
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
    const [surveyHabitatFeatures, surveyHabitatFeaturesCount, surveyHabitatFeatureTypeDefinitions, samplePeriods] =
      await Promise.all([
        // Fetch survey habitat feature records
        this.getSurveyHabitatFeatures(surveyId, pagination),
        // Fetch pagination count data
        this.getSurveyHabitatFeaturesCount(surveyId),
        // Fetch habitat feature definitions applicable to this survey
        this.getSurveyHabitatFeatureDefinitions(surveyId),
        // Fetch sampling periods applicable to this survey
        this.samplePeriodService.getSamplePeriodsForSurvey(surveyId)
      ]);

    return {
      surveyHabitatFeatures: surveyHabitatFeatures,
      supplementaryData: {
        count: surveyHabitatFeaturesCount,
        sampling_periods: samplePeriods,
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
   * Get habitat feature spatial data, for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyHabitatFeaturesGeometryWithSupplementaryData>}
   * @memberof SurveyHabitatFeatureService
   */
  async getSurveyHabitatFeaturesGeometry(
    surveyId: number
  ): Promise<SurveyHabitatFeaturesGeometryWithSupplementaryData> {
    const [surveyHabitatFeaturesGeometry, surveyHabitatFeaturesCount] = await Promise.all([
      this.surveyHabitatFeatureRepository.getSurveyHabitatFeaturesGeometry(surveyId),
      this.getSurveyHabitatFeaturesCount(surveyId)
    ]);

    return {
      surveyHabitatFeaturesGeometry: surveyHabitatFeaturesGeometry,
      supplementaryData: {
        count: surveyHabitatFeaturesCount
      }
    };
  }

  /**
   * Get survey habitat features for the current user, based on their permissions and filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {number} systemUserId
   * @param {FindSurveyHabitatFeatureAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveyHabitatFeatureWithTaxonsAndSampling[]>}
   * @memberof SurveyHabitatFeatureService
   */
  async findSurveyHabitatFeatures(
    isUserAdmin: boolean,
    systemUserId: number,
    filterFields: FindSurveyHabitatFeatureAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyHabitatFeatureWithTaxonsAndSampling[]> {
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

  /**
   * Validate all TSNs in a list of survey habitat features against ITIS (Biohub PlatformService).
   *
   * @param {Array<{ survey_habitat_feature_taxons: InsertSurveyHabitatFeatureTaxon[] }>} surveyHabitatFeatures
   * @return {*} {Promise<boolean>}
   * @memberof SurveyHabitatFeatureService
   */
  async _validateSurveyHabitatFeaturesTsns(
    surveyHabitatFeatures: Array<{
      survey_habitat_feature_taxons: InsertSurveyHabitatFeatureTaxon[];
    }>
  ): Promise<boolean> {
    // Get all unique taxon TSNs from the habitat features
    const habitatFeatureTsns = new Set(
      surveyHabitatFeatures.flatMap((surveyHabitatFeature) =>
        surveyHabitatFeature.survey_habitat_feature_taxons.map((taxon) => taxon.itis_tsn)
      )
    );

    // Fetch taxon data for all unique TSNs
    const validatedTaxons = await this.platformService.getTaxonomyByTsns(Array.from(habitatFeatureTsns));

    // log the tsns that were not validated
    defaultLog.debug({
      label: '_validateSurveyHabitatFeaturesTsns',
      message: 'Failed to validate all TSNs',
      valid_tsns: validatedTaxons.map((validatedTaxon) => validatedTaxon.tsn),
      invalid_tsns: Array.from(habitatFeatureTsns).filter(
        (incomingTsn) => !validatedTaxons.find((validatedTaxon) => validatedTaxon.tsn === incomingTsn)
      )
    });

    return validatedTaxons.length === habitatFeatureTsns.size;
  }
}
