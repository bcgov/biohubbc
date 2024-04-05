import { IDBConnection } from '../database/db';
import { HTTP400 } from '../errors/http-error';
import {
  InsertSamplePeriodRecord,
  SamplePeriodHierarchyIds,
  SamplePeriodRecord,
  SamplePeriodRepository,
  UpdateSamplePeriodRecord
} from '../repositories/sample-period-repository';
import { DBService } from './db-service';
import { ObservationService } from './observation-service';

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
   *  Gets all survey Sample periods.
   *
   * @param {number} surveyId
   * @param {number} surveySampleMethodId
   * @return {*}  {Promise<SamplePeriodRecord[]>}
   * @memberof SamplePeriodService
   */
  async getSamplePeriodsForSurveyMethodId(
    surveyId: number,
    surveySampleMethodId: number
  ): Promise<SamplePeriodRecord[]> {
    return this.samplePeriodRepository.getSamplePeriodsForSurveyMethodId(surveyId, surveySampleMethodId);
  }

  /**
   * Gets the full hierarchy of sample_site_id, sample_method_id, and sample_period_id for a given sample period id.
   *
   * @param {number} surveyId
   * @param {number} surveySamplePeriodId
   * @return {*}  {Promise<SamplePeriodHierarchyIds>}
   * @memberof SamplePeriodService
   */
  async getSamplePeriodHierarachyIds(
    surveyId: number,
    surveySamplePeriodId: number
  ): Promise<SamplePeriodHierarchyIds> {
    return this.samplePeriodRepository.getSamplePeriodHierarachyIds(surveyId, surveySamplePeriodId);
  }

  /**
   * Deletes a survey Sample Period.
   *
   * @param {number} surveyId
   * @param {number} surveySamplePeriodId
   * @return {*}  {Promise<SamplePeriodRecord>}
   * @memberof SamplePeriodService
   */
  async deleteSamplePeriodRecord(surveyId: number, surveySamplePeriodId: number): Promise<SamplePeriodRecord> {
    return this.samplePeriodRepository.deleteSamplePeriodRecord(surveyId, surveySamplePeriodId);
  }

  /**
   * Deletes multiple Survey Sample Periods for a given array of period ids.
   *
   * @param {number[]} periodsToDelete an array of period ids to delete
   * @returns {*} {Promise<SamplePeriodRecord[]>} an array of promises for the deleted periods
   * @memberof SamplePeriodService
   */
  async deleteSamplePeriodRecords(surveyId: number, periodsToDelete: number[]): Promise<SamplePeriodRecord[]> {
    return this.samplePeriodRepository.deleteSamplePeriods(surveyId, periodsToDelete);
  }

  /**
   * Inserts survey Sample Period.
   *
   * @param {InsertSamplePeriodRecord} samplePeriod
   * @return {*}  {Promise<SamplePeriodRecord>}
   * @memberof SamplePeriodService
   */
  async insertSamplePeriod(samplePeriod: InsertSamplePeriodRecord): Promise<SamplePeriodRecord> {
    return this.samplePeriodRepository.insertSamplePeriod(samplePeriod);
  }

  /**
   * updates a survey Sample Period.
   *
   * @param {UpdateSamplePeriodRecord} samplePeriod
   * @return {*}  {Promise<SamplePeriodRecord>}
   * @memberof SamplePeriodService
   */
  async updateSamplePeriod(surveyId: number, samplePeriod: UpdateSamplePeriodRecord): Promise<SamplePeriodRecord> {
    return this.samplePeriodRepository.updateSamplePeriod(surveyId, samplePeriod);
  }

  /**
   * Fetches and compares any existing sample periods for a given sample method id.
   * Any sample periods not found in the given array will be deleted.
   *
   * @param {number} surveySampleMethodId
   * @param {UpdateSampleMethodRecord[]} newPeriod
   * @memberof SamplePeriodService
   */
  async deleteSamplePeriodsNotInArray(
    surveyId: number,
    surveySampleMethodId: number,
    newPeriod: UpdateSamplePeriodRecord[]
  ) {
    // Get any existing Period for the given sample method
    const existingPeriods = await this.getSamplePeriodsForSurveyMethodId(surveyId, surveySampleMethodId);

    // Compare input and existing for Period to delete
    // Any existing periods that are not found in the new Periods being passed in will be collected for deletion
    const existingPeriodsToDelete = existingPeriods.filter((existingPeriod) => {
      return !newPeriod.find(
        (incomingMethod) => incomingMethod.survey_sample_period_id === existingPeriod.survey_sample_period_id
      );
    });

    const observationService = new ObservationService(this.connection);

    // Delete any Periods not found in the passed in array
    if (existingPeriodsToDelete.length > 0) {
      const existingSamplePeriodIds = existingPeriodsToDelete.map((period) => period.survey_sample_period_id);
      const samplingPeriodObservationsCount = await observationService.getObservationsCountBySamplePeriodIds(
        existingSamplePeriodIds
      );

      if (samplingPeriodObservationsCount > 0) {
        throw new HTTP400('Cannot delete a sample period that is associated with an observation');
      }

      await this.deleteSamplePeriodRecords(surveyId, existingSamplePeriodIds);
    }
  }
}
