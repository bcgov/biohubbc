import { IDBConnection } from '../database/db';
import { PostSamplePeriod, SamplePeriodRecord, SamplePeriodRepository } from '../repositories/sample-period-repository';
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
   * @param {number} samplePeriodId
   * @return {*}  {Promise<SamplePeriodRecord>}
   * @memberof SamplePeriodService
   */
  async deleteSamplePeriodRecord(samplePeriodId: number): Promise<SamplePeriodRecord> {
    return this.samplePeriodRepository.deleteSamplePeriodRecord(samplePeriodId);
  }

  /**
   * Inserts survey Sample Period.
   *
   * @param {Omit<PostSamplePeriod, 'survey_sample_period_id'>} samplePeriod
   * @return {*}  {Promise<SamplePeriodRecord>}
   * @memberof SamplePeriodService
   */
  async insertSamplePeriod(
    samplePeriod: Omit<PostSamplePeriod, 'survey_sample_period_id'>
  ): Promise<SamplePeriodRecord> {
    return this.samplePeriodRepository.insertSamplePeriod(samplePeriod);
  }

  /**
   * updates a survey Sample Period.
   *
   * @param {PostSamplePeriod} samplePeriod
   * @return {*}  {Promise<SamplePeriodRecord>}
   * @memberof SamplePeriodService
   */
  async updateSamplePeriod(samplePeriod: PostSamplePeriod): Promise<SamplePeriodRecord> {
    return this.samplePeriodRepository.updateSamplePeriod(samplePeriod);
  }
}
