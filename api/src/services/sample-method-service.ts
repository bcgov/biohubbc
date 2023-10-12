import { IDBConnection } from '../database/db';
import {
  InsertSampleMethodRecord,
  SampleMethodRecord,
  SampleMethodRepository,
  UpdateSampleMethodRecord
} from '../repositories/sample-method-repository';
import { DBService } from './db-service';
import { SamplePeriodService } from './sample-period-service';

/**
 * Sample Method Repository
 *
 * @export
 * @class SampleMethodService
 * @extends {DBService}
 */
export class SampleMethodService extends DBService {
  sampleMethodRepository: SampleMethodRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.sampleMethodRepository = new SampleMethodRepository(connection);
  }

  /**
   * Gets all survey Sample Methods.
   *
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleMethodRecord[]>}
   * @memberof SampleMethodService
   */
  async getSampleMethodsForSurveySampleSiteId(surveySampleSiteId: number): Promise<SampleMethodRecord[]> {
    return await this.sampleMethodRepository.getSampleMethodsForSurveySampleSiteId(surveySampleSiteId);
  }

  /**
   * Deletes a survey Sample Method.
   *
   * @param {number} surveySampleMethodId
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodService
   */
  async deleteSampleMethodRecord(surveySampleMethodId: number): Promise<SampleMethodRecord> {
    const samplePeriodService = new SamplePeriodService(this.connection);

    // Delete all associated sample periods
    const existingSamplePeriods = await samplePeriodService.getSamplePeriodsForSurveyMethodId(surveySampleMethodId);
    const periodsToDelete = existingSamplePeriods.map((item) => item.survey_sample_period_id);
    await samplePeriodService.deleteSamplePeriodRecords(periodsToDelete);

    return this.sampleMethodRepository.deleteSampleMethodRecord(surveySampleMethodId);
  }

  /**
   * Inserts survey Sample Method and associated Sample Periods.
   *
   * @param {InsertSampleMethodRecord} sampleMethod
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodService
   */
  async insertSampleMethod(sampleMethod: InsertSampleMethodRecord): Promise<SampleMethodRecord> {
    // Create new sample method
    const record = await this.sampleMethodRepository.insertSampleMethod(sampleMethod);

    const samplePeriodService = new SamplePeriodService(this.connection);
    // Loop through and create periods, associating the newly created sample method id to each
    const promises = sampleMethod.periods.map((item) => {
      const samplePeriod = {
        survey_sample_method_id: record.survey_sample_method_id,
        start_date: item.start_date,
        end_date: item.end_date
      };
      return samplePeriodService.insertSamplePeriod(samplePeriod);
    });

    await Promise.all(promises);
    return record;
  }

  /**
   * Fetches and compares any existing sample methods for a given sample site id.
   * Any sample methods not found in the given array will be deleted.
   *
   * @param {number} surveySampleSiteId
   * @param {UpdateSampleMethodRecord[]} newMethods
   * @memberof SampleMethodService
   */
  async deleteSampleMethodsNotInArray(surveySampleSiteId: number, newMethods: UpdateSampleMethodRecord[]) {
    //Get any existing methods for the sample site
    const existingMethods = await this.getSampleMethodsForSurveySampleSiteId(surveySampleSiteId);

    //Compare input and existing for methods to delete
    // Any existing methods that are not found in the new methods being passed in will be collected for deletion
    const existingMethodsToDelete = existingMethods.filter((existingMethod) => {
      return !newMethods.find(
        (incomingMethod) => incomingMethod.survey_sample_method_id === existingMethod.survey_sample_method_id
      );
    });

    // Delete any methods not found in the passed in array
    if (existingMethodsToDelete.length > 0) {
      const promises: Promise<any>[] = [];

      existingMethodsToDelete.forEach((method: any) => {
        promises.push(this.deleteSampleMethodRecord(method.survey_sample_method_id));
      });

      await Promise.all(promises);
    }
  }

  /**
   * updates a survey Sample method.
   *
   * @param {InsertSampleMethodRecord} sampleMethod
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodService
   */
  async updateSampleMethod(sampleMethod: UpdateSampleMethodRecord): Promise<SampleMethodRecord> {
    const samplePeriodService = new SamplePeriodService(this.connection);

    // Check for any sample periods to delete
    await samplePeriodService.deleteSamplePeriodsNotInArray(sampleMethod.survey_sample_method_id, sampleMethod.periods);

    // Loop through all new sample periods
    // For each sample period, check if it exists in the existing list
    // If it does, update it, otherwise create it
    for (const item of sampleMethod.periods) {
      if (item.survey_sample_period_id) {
        await samplePeriodService.updateSamplePeriod(item);
      } else {
        const samplePeriod = {
          survey_sample_method_id: sampleMethod.survey_sample_method_id,
          start_date: item.start_date,
          end_date: item.end_date
        };
        await samplePeriodService.insertSamplePeriod(samplePeriod);
      }
    }

    return this.sampleMethodRepository.updateSampleMethod(sampleMethod);
  }
}
