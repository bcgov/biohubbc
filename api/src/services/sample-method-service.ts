import { SurveySampleMethodModel } from '../database-models/survey_sample_method';
import { IDBConnection } from '../database/db';
import { HTTP409 } from '../errors/http-error';
import { UpdateSampleMethodObject } from '../models/sample-period';
import {
  InsertSampleMethodRecord,
  SampleMethodRepository,
  UpdateSampleMethodRecord
} from '../repositories/sample-method-repository';
import { DBService } from './db-service';
import { ObservationService } from './observation-service';
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
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SurveySampleMethodModel[]>}
   * @memberof SampleMethodService
   */
  async getSampleMethodsForSurveySampleSiteId(
    surveyId: number,
    surveySampleSiteId: number
  ): Promise<SurveySampleMethodModel[]> {
    return this.sampleMethodRepository.getSampleMethodsForSurveySampleSiteId(surveyId, surveySampleSiteId);
  }

  /**
   * Gets count of sample methods associated with one or more method technique Ids
   *
   * @param {number[]} techniqueIds
   * @return {*}  {Promise<number>}
   * @memberof SampleMethodService
   */
  async getSampleMethodsCountForTechniqueIds(techniqueIds: number[]): Promise<number> {
    return this.sampleMethodRepository.getSampleMethodsCountForTechniqueIds(techniqueIds);
  }

  /**
   * Deletes a survey Sample Method.
   *
   * @param {number} surveyId
   * @param {number} surveySampleMethodId
   * @return {*}  {Promise<SurveySampleMethodModel>}
   * @memberof SampleMethodService
   */
  async deleteSampleMethodRecord(surveyId: number, surveySampleMethodId: number): Promise<SurveySampleMethodModel> {
    const samplePeriodService = new SamplePeriodService(this.connection);

    // Collect list of periods to delete
    const existingSamplePeriods = await samplePeriodService.getSamplePeriodsForSurveyMethodId(
      surveyId,
      surveySampleMethodId
    );
    const periodsToDelete = existingSamplePeriods.map((item) => item.survey_sample_period_id);
    // Delete all associated sample periods
    await samplePeriodService.deleteSamplePeriodRecords(surveyId, periodsToDelete);

    return this.sampleMethodRepository.deleteSampleMethodRecord(surveyId, surveySampleMethodId);
  }

  /**
   * Inserts survey Sample Method and associated Sample Periods.
   *
   * @param {InsertSampleMethodRecord} sampleMethod
   * @return {*}  {Promise<SurveySampleMethodModel>}
   * @memberof SampleMethodService
   */
  async insertSampleMethod(sampleMethod: InsertSampleMethodRecord): Promise<SurveySampleMethodModel> {
    // Create new sample method
    const sampleMethodRecord = await this.sampleMethodRepository.insertSampleMethod(sampleMethod);

    const samplePeriodService = new SamplePeriodService(this.connection);

    // Loop through and create associated sample periods
    const promises = sampleMethod.sample_periods.map((item) => {
      const samplePeriod = {
        survey_sample_method_id: sampleMethodRecord.survey_sample_method_id,
        start_date: item.start_date,
        end_date: item.end_date,
        start_time: item.start_time,
        end_time: item.end_time
      };
      return samplePeriodService.insertSamplePeriod(samplePeriod);
    });

    await Promise.all(promises);

    return sampleMethodRecord;
  }

  /**
   * Inserts survey Sample Methods and associated Sample Periods.
   *
   * @param {InsertSampleMethodRecord[]} sampleMethods
   * @return {*}  {Promise<SurveySampleMethodModel[]>}
   * @memberof SampleMethodService
   */
  async insertSampleMethods(sampleMethods: InsertSampleMethodRecord[]): Promise<SurveySampleMethodModel[]> {
    // Loop through and create each sample method and its associated sample periods
    const promises = sampleMethods.map((sampleMethod) => {
      return this.insertSampleMethod(sampleMethod);
    });

    const insertedMethods = await Promise.all(promises);

    return insertedMethods;
  }

  /**
   * Fetches and compares any existing sample methods for a given sample site id.
   * Any sample methods not found in the given array will be deleted.
   *
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @param {UpdateSampleMethodRecord[]} newMethods
   * @memberof SampleMethodService
   */
  async deleteSampleMethodsNotInArray(
    surveyId: number,
    surveySampleSiteId: number,
    newMethods: UpdateSampleMethodRecord[]
  ) {
    //Get any existing methods for the sample site
    const existingMethods = await this.getSampleMethodsForSurveySampleSiteId(surveyId, surveySampleSiteId);

    //Compare input and existing for methods to delete
    // Any existing methods that are not found in the new methods being passed in will be collected for deletion
    const existingMethodsToDelete = existingMethods.filter((existingMethod) => {
      return !newMethods.find(
        (incomingMethod) => incomingMethod.survey_sample_method_id === existingMethod.survey_sample_method_id
      );
    });

    const observationService = new ObservationService(this.connection);

    // Delete any methods not found in the passed in array
    if (existingMethodsToDelete.length > 0) {
      // Check if any observations are associated with the methods to be deleted
      const existingSampleMethodIds = existingMethodsToDelete.map((method) => method.survey_sample_method_id);
      const samplingMethodObservationsCount = await observationService.getObservationsCountBySampleMethodIds(
        existingSampleMethodIds
      );
      if (samplingMethodObservationsCount > 0) {
        // TODO services should not throw HTTP errors (only endpoints should)
        throw new HTTP409('Cannot delete a sample method that is associated with an observation');
      }

      await Promise.all(
        existingMethodsToDelete.map((sampleMethod) =>
          this.deleteSampleMethodRecord(surveyId, sampleMethod.survey_sample_method_id)
        )
      );
    }
  }

  /**
   * updates a survey Sample method.
   *
   * @param {number} surveyId
   * @param {InsertSampleMethodRecord} sampleMethod
   * @return {*}  {Promise<SurveySampleMethodModel>}
   * @memberof SampleMethodService
   */
  async updateSampleMethod(surveyId: number, sampleMethod: UpdateSampleMethodObject): Promise<SurveySampleMethodModel> {
    return this.sampleMethodRepository.updateSampleMethod(surveyId, sampleMethod);
  }
}
