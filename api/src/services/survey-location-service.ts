import { IDBConnection } from '../database/db';
import { PostLocationData } from '../models/survey-create';
import { PutSurveyLocationData } from '../models/survey-update';
import { SurveyLocationRecord, SurveyLocationRepository } from '../repositories/survey-location-repository';
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

  async updateSurveyLocation(data: PutSurveyLocationData): Promise<void> {
    return await this.surveyLocationRepository.updateSurveyLocation(data);
  }
  /**
   * Get Survey location for a given survey ID
   *
   * @param {number} surveyID
   * @returns {*} {Promise<SurveyLocationRecord[]>}
   * @memberof SurveyLocationService
   */
  async getSurveyLocationsData(surveyId: number): Promise<SurveyLocationRecord[]> {
    return this.surveyLocationRepository.getSurveyLocationsData(surveyId);
  }
}
