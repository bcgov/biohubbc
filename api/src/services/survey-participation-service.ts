import { IDBConnection } from '../database/db';
import {
  SurveyJob,
  SurveyParticipantWithJob,
  SurveyParticipationRepository
} from '../repositories/survey-participation-repository';
import { DBService } from './db-service';

export class SurveyParticipationService extends DBService {
  surveyParticipationRepository: SurveyParticipationRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.surveyParticipationRepository = new SurveyParticipationRepository(connection);
  }

  async getSurveyJobs(): Promise<SurveyJob[]> {
    return this.surveyParticipationRepository.getSurveyJobs();
  }

  async getSurveyParticipant(surveyId: number, systemUserId: number): Promise<SurveyParticipantWithJob | null> {
    return this.surveyParticipationRepository.getSurveyParticipant(surveyId, systemUserId);
  }

  async getSurveyParticipants(surveyId: number): Promise<SurveyParticipantWithJob[]> {
    return this.surveyParticipationRepository.getSurveyParticipants(surveyId);
  }

  async insertSurveyParticipant(surveyId: number, systemUserId: number, surveyJobId: number): Promise<void> {
    return this.surveyParticipationRepository.insertSurveyParticipant(surveyId, systemUserId, surveyJobId);
  }

  async deleteSurveyParticipationRecord(surveyParticipationId: number): Promise<any> {
    return this.surveyParticipationRepository.deleteSurveyParticipationRecord(surveyParticipationId);
  }
}
