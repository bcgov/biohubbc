import { IDBConnection } from '../database/db';
import { SampleLocationRecord, SampleLocationRepository } from '../repositories/sample-location-repository';
import { DBService } from './db-service';

export class SampleLocationService extends DBService {
  sampleLocationRepository: SampleLocationRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.sampleLocationRepository = new SampleLocationRepository(connection);
  }

  async getSampleLocationsForSurveyId(surveyId: number): Promise<SampleLocationRecord[]> {
    return await this.sampleLocationRepository.getSampleLocationsForSurveyId(surveyId);
  }

  async deleteSampleLocationRecord(sampleLocationId: number): Promise<SampleLocationRecord> {
    return this.sampleLocationRepository.deleteSampleLocationRecord(sampleLocationId);
  }
}
