import { IDBConnection } from '../database/db';
import { SamplePeriodRecord, SamplePeriodRepository } from '../repositories/sample-period-repository';
import { DBService } from './db-service';

export class SamplePeriodService extends DBService {
  samplePeriodRepository: SamplePeriodRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.samplePeriodRepository = new SamplePeriodRepository(connection);
  }

  async getSamplePeriodsForSurveyMethodId(surveyId: number): Promise<SamplePeriodRecord[]> {
    return await this.samplePeriodRepository.getSamplePeriodsForSurveyMethodId(surveyId);
  }

  async deleteSamplePeriodRecord(surveyBlockId: number): Promise<SamplePeriodRecord> {
    return this.samplePeriodRepository.deleteSamplePeriodRecord(surveyBlockId);
  }
}
