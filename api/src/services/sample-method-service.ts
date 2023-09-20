import { IDBConnection } from '../database/db';
import { PostSampleMethod, SampleMethodRecord, SampleMethodRepository } from '../repositories/sample-method-repository';
import { DBService } from './db-service';

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
   * Inserts survey Sample Method.
   *
   * @param {PostSampleMethod} sampleMethod
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodService
   */
  async insertSampleMethod(sampleMethod: PostSampleMethod): Promise<SampleMethodRecord> {
    return this.sampleMethodRepository.insertSampleMethod(sampleMethod);
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
