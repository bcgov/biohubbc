import { IDBConnection } from '../database/db';
import { SampleMethodRecord, SampleMethodRepository } from '../repositories/sample-method-repository';
import { DBService } from './db-service';

export class SampleMethodService extends DBService {
  sampleMethodRepository: SampleMethodRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.sampleMethodRepository = new SampleMethodRepository(connection);
  }

  async getSampleMethodsForSurveySampleSiteId(surveyId: number): Promise<SampleMethodRecord[]> {
    return await this.sampleMethodRepository.getSampleMethodsForSurveySampleSiteId(surveyId);
  }

  async deleteSampleMethodRecord(surveyBlockId: number): Promise<SampleMethodRecord> {
    return this.sampleMethodRepository.deleteSampleMethodRecord(surveyBlockId);
  }
}
