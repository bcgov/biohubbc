import { IDBConnection } from '../database/db';
import {
  InsertSamplePeriodRecord,
  SamplePeriodRecord,
  SamplePeriodRepository,
  UpdateSamplePeriodRecord
} from '../repositories/sample-period-repository';
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
   *  Gets all survey Sample periods.
   *
   * @param {number} surveySampleMethodId
   * @return {*}  {Promise<SamplePeriodRecord[]>}
   * @memberof SamplePeriodService
   */
  async getSamplePeriodsForSurveyMethodId(surveySampleMethodId: number): Promise<SamplePeriodRecord[]> {
    return await this.samplePeriodRepository.getSamplePeriodsForSurveyMethodId(surveySampleMethodId);
  }

  /**
   * Deletes a survey Sample Period.
   *
   * @param {number} surveySamplePeriodId
   * @return {*}  {Promise<SamplePeriodRecord>}
   * @memberof SamplePeriodService
   */
  async deleteSamplePeriodRecord(surveySamplePeriodId: number): Promise<SamplePeriodRecord> {
    return this.samplePeriodRepository.deleteSamplePeriodRecord(surveySamplePeriodId);
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
  async updateSamplePeriod(samplePeriod: UpdateSamplePeriodRecord): Promise<SamplePeriodRecord> {
    return this.samplePeriodRepository.updateSamplePeriod(samplePeriod);
  }

  /**
   * Checks for sample Period to delete.
   *
   * @param {number} surveySampleMethodId
   * @param {UpdateSampleMethodRecord[]} newPeriod
   * @memberof SamplePeriodService
   */
  async checkSamplePeriodToDelete(surveySampleMethodId: number, newPeriod: UpdateSamplePeriodRecord[]) {
    //Get any existing Period for the sample location
    const existingPeriod = await this.getSamplePeriodsForSurveyMethodId(surveySampleMethodId);

    //Compare input and existing for Period to delete
    const existingPeriodToDelete = existingPeriod.filter((existingPeriod) => {
      return !newPeriod.find(
        (incomingMethod) => incomingMethod.survey_sample_period_id === existingPeriod.survey_sample_period_id
      );
    });

    // Delete any non existing Period
    if (existingPeriodToDelete.length > 0) {
      const promises: Promise<any>[] = [];

      existingPeriodToDelete.forEach((method: any) => {
        promises.push(this.deleteSamplePeriodRecord(method.survey_sample_period_id));
      });

      await Promise.all(promises);
    }
  }
}
