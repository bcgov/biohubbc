import { IDBConnection } from '../database/db';
import { PostLocationData } from '../models/survey-create';
import { SurveyLocationRepository } from '../repositories/survey-location-repository';
import { DBService } from './db-service';

export class SurveyLocationService extends DBService {
  surveyLocationRepository: SurveyLocationRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.surveyLocationRepository = new SurveyLocationRepository(connection);
  }

  async insertSurveyLocation(surveyId: number, data: PostLocationData): Promise<void> {
    return await this.surveyLocationRepository.insertSurveyLocation(surveyId, data);
  }
}
