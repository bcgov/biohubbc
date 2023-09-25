import { IDBConnection } from '../database/db';
import { PostSampleMethod, SampleMethodRecord, SampleMethodRepository } from '../repositories/sample-method-repository';
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
   * @param {number} surveyId
   * @return {*}  {Promise<SampleMethodRecord[]>}
   * @memberof SampleMethodService
   */
  async getSampleMethodsForSurveySampleSiteId(surveyId: number): Promise<SampleMethodRecord[]> {
    return await this.sampleMethodRepository.getSampleMethodsForSurveySampleSiteId(surveyId);
  }

  /**
   * Deletes a survey Sample Method.
   *
   * @param {number} surveyBlockId
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodService
   */
  async deleteSampleMethodRecord(surveyBlockId: number): Promise<SampleMethodRecord> {
    return this.sampleMethodRepository.deleteSampleMethodRecord(surveyBlockId);
  }

  /**
   * Inserts survey Sample Method and associated Sample Periods.
   *
   * @param {Omit<PostSampleMethod, 'survey_sample_method_id'>} sampleMethod
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodService
   */
  async insertSampleMethod(
    sampleMethod: Omit<PostSampleMethod, 'survey_sample_method_id'>
  ): Promise<SampleMethodRecord> {
    const record = await this.sampleMethodRepository.insertSampleMethod(sampleMethod);

    const samplePeriodService = new SamplePeriodService(this.connection);
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
   * updates a survey Sample method.
   *
   * @param {PostSampleMethod} sampleMethod
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodService
   */
  async updateSampleMethod(sampleMethod: PostSampleMethod): Promise<SampleMethodRecord> {
    return this.sampleMethodRepository.updateSampleMethod(sampleMethod);
  }
}
