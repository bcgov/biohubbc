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
    const promises = existingSamplePeriods.map((item) => {
      return samplePeriodService.deleteSamplePeriodRecord(item.survey_sample_period_id);
    });
    await Promise.all(promises);

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
   * Checks for sample methods to delete.
   *
   * @param {number} surveySampleSiteId
   * @param {UpdateSampleMethodRecord[]} newMethods
   * @memberof SampleMethodService
   */
  async checkSampleMethodsToDelete(surveySampleSiteId: number, newMethods: UpdateSampleMethodRecord[]) {
    //Get any existing methods for the sample location
    const existingMethods = await this.getSampleMethodsForSurveySampleSiteId(surveySampleSiteId);
    console.log('existingMethods', existingMethods);

    //Compare input and existing for methods to delete
    const existingMethodsToDelete = existingMethods.filter((existingMethod) => {
      return !newMethods.find(
        (incomingMethod) => incomingMethod.survey_sample_method_id === existingMethod.survey_sample_method_id
      );
    });
    console.log('existingMethodsToDelete', existingMethodsToDelete);

    // Delete any non existing methods
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
    console.log('sampleMethod', sampleMethod);
    const samplePeriodService = new SamplePeriodService(this.connection);

    // Check for any sample periods to delete
    await samplePeriodService.checkSamplePeriodToDelete(sampleMethod.survey_sample_method_id, sampleMethod.periods);

    // Loop through all new sample periods
    // For each sample period, check if it exists in the existing list
    // If it does, update it, otherwise create it
    const promises = sampleMethod.periods.map((item) => {
      if (item.survey_sample_period_id) {
        console.log('UPDATE Period item', item);
        return samplePeriodService.updateSamplePeriod(item);
      } else {
        const samplePeriod = {
          survey_sample_method_id: sampleMethod.survey_sample_method_id,
          start_date: item.start_date,
          end_date: item.end_date
        };
        console.log('INSERTs Period item', item);

        return samplePeriodService.insertSamplePeriod(samplePeriod);
      }
    });
    await Promise.all(promises);

    return this.sampleMethodRepository.updateSampleMethod(sampleMethod);
  }
}
