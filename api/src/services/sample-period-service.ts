import { SurveySamplePeriodRecord } from '../database-models/survey_sample_period';
import { IDBConnection } from '../database/db';
import { IPeriodAdvancedFilters } from '../models/period-view';

import {
  InsertSamplePeriodObject,
  SamplePeriodRepository,
  SurveySamplePeriodDetails,
  UpdateSamplePeriodObject
} from '../repositories/sample-period-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { DBService } from './db-service';

/**
 * Sample Period Repository
 *
 * @export
 * @class SamplePeriodService
 * @extends {DBService}
 */
export class SamplePeriodService extends DBService {
  samplePeriodRepository: SamplePeriodRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.samplePeriodRepository = new SamplePeriodRepository(connection);
  }

  /**
   * Insert survey Sample Periods.
   *
   * TODO: Update to insert multiple periods in a single query.
   *
   * @param {number} surveyId
   * @param {InsertSamplePeriodObject[]} periods
   * @return {*}  {Promise<void>}
   * @memberof SamplePeriodService
   */
  async insertSamplePeriods(surveyId: number, periods: InsertSamplePeriodObject[]): Promise<void> {
    await Promise.all(
      periods.map((samplePeriod) => this.samplePeriodRepository.insertSamplePeriod(surveyId, samplePeriod))
    );
  }

  /**
   * Gets all survey Sample periods.
   *
   * @param {number}[] surveyIds
   * @param {{ pagination?: ApiPaginationOptions }} [options]
   * @return {*}  {Promise<SurveySamplePeriodDetails[]>}
   * @memberof SamplePeriodService
   */
  async getSamplePeriodsForSurveys(
    surveyIds: number[],
    options?: {
      filterFields?: {
        surveyObservationIds?: number[];
      };
      pagination?: ApiPaginationOptions;
    }
  ): Promise<SurveySamplePeriodDetails[]> {
    return this.samplePeriodRepository.getSamplePeriodsForSurveys(surveyIds, options);
  }

  /**
   * Gets all survey Sample periods for a given observation.
   *
   * @param {number[]} surveyIds
   * @param {number} surveyObservationId
   * @return {*}  {Promise<SurveySamplePeriodDetails[]>}
   * @memberof SamplePeriodService
   */
  async getSamplePeriodsForObservation(
    surveyIds: number[],
    surveyObservationId: number
  ): Promise<SurveySamplePeriodDetails[]> {
    return this.samplePeriodRepository.getSamplePeriodsForObservation(surveyIds, surveyObservationId);
  }

  /**
   * Gets all survey Sample periods count.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof SamplePeriodService
   */
  async getSamplePeriodsCountForSurvey(surveyId: number): Promise<number> {
    return this.samplePeriodRepository.getSamplePeriodsCountForSurvey(surveyId);
  }

  /**
   * Gets a survey sample period by its id
   *
   * @param {number} surveyId
   * @param {number} surveySamplePeriodId
   * @return {*}  {Promise<SurveySamplePeriodDetails>}
   * @memberof SamplePeriodService
   */
  async getSamplePeriodById(surveyId: number, surveySamplePeriodId: number): Promise<SurveySamplePeriodDetails> {
    return this.samplePeriodRepository.getSamplePeriodById(surveyId, surveySamplePeriodId);
  }

  /**
   * Retrieves the paginated list of all periods that are available to the user, based on their permissions and
   * provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {IPeriodAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveySamplePeriodRecord[]>}
   * @memberof SampleSiteService
   */
  async findSamplePeriods(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IPeriodAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<SurveySamplePeriodRecord[]> {
    return this.samplePeriodRepository.findSamplePeriods(isUserAdmin, systemUserId, filterFields, pagination);
  }

  /**
   * Retrieves the count of all periods that are available to the user, based on their permissions and
   * provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {IPeriodAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof SampleSiteService
   */
  async findSamplePeriodsCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IPeriodAdvancedFilters
  ): Promise<number> {
    return this.samplePeriodRepository.findSamplePeriodsCount(isUserAdmin, systemUserId, filterFields);
  }

  /**
   * Updates a survey Sample Period.
   *
   * @param {number} surveyId
   * @param {UpdateSamplePeriodObject} data
   * @return {*}  {Promise<UpdateSamplePeriodObject>}
   * @memberof SamplePeriodService
   */
  async updateSamplePeriod(surveyId: number, data: UpdateSamplePeriodObject): Promise<void> {
    return this.samplePeriodRepository.updateSamplePeriod(surveyId, data);
  }

  /**
   * Deletes a survey Sample Period.
   *
   * @param {number} surveyId
   * @param {number} surveySamplePeriodId
   * @return {*}  {Promise<void>}
   * @memberof SamplePeriodService
   */
  async deleteSamplePeriod(surveyId: number, surveySamplePeriodId: number): Promise<void> {
    return this.samplePeriodRepository.deleteSamplePeriod(surveyId, surveySamplePeriodId);
  }

  /**
   * Deletes multiple Survey Sample Periods for a given array of period ids.
   *
   * @param {number[]} periodsToDelete an array of period ids to delete
   * @returns {*} {Promise<void>}
   * @memberof SamplePeriodService
   */
  async deleteSamplePeriods(surveyId: number, periodsToDelete: number[]): Promise<void> {
    return this.samplePeriodRepository.deleteSamplePeriods(surveyId, periodsToDelete);
  }
}
