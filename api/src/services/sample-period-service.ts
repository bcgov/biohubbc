import { IDBConnection } from '../database/db';
import {
  InsertSamplePeriod,
  SamplePeriodRecord,
  SamplePeriodRepository,
  UpdateSamplePeriod
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
   * @param {InsertSamplePeriod} samplePeriod
   * @return {*}  {Promise<SamplePeriodRecord>}
   * @memberof SamplePeriodService
   */
  async insertSamplePeriod(samplePeriod: InsertSamplePeriod): Promise<SamplePeriodRecord> {
    return this.samplePeriodRepository.insertSamplePeriod(samplePeriod);
  }

  /**
   * updates a survey Sample Period.
   *
   * @param {UpdateSamplePeriod} samplePeriod
   * @return {*}  {Promise<SamplePeriodRecord>}
   * @memberof SamplePeriodService
   */
  async updateSamplePeriod(samplePeriod: UpdateSamplePeriod): Promise<SamplePeriodRecord> {
    return this.samplePeriodRepository.updateSamplePeriod(samplePeriod);
  }
}
