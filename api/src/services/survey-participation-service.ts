import { IDBConnection } from '../database/db';
import { ISurveyParticipation, SurveyParticipationRepository } from '../repositories/survey-participation-repository';
import { DBService } from './db-service';

export class SurveyParticipationService extends DBService {
  surveyParticipationRepository: SurveyParticipationRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.surveyParticipationRepository = new SurveyParticipationRepository(connection);
  }

  async deleteSurveyParticipationRecord(surveyParticipationId: number): Promise<any> {
    return this.surveyParticipationRepository.deleteSurveyParticipationRecord(surveyParticipationId);
  }

  async getSurveyParticipant(surveyId: number, systemUserId: number): Promise<ISurveyParticipation | null> {
    return this.surveyParticipationRepository.getSurveyParticipant(surveyId, systemUserId);
  }

  async getSurveyParticipants(surveyId: number): Promise<object[]> {
    return this.surveyParticipationRepository.getSurveyParticipants(surveyId);
  }

  async addSurveyParticipant(surveyId: number, systemUserId: number, surveyJobId: number): Promise<void> {
    return this.surveyParticipationRepository.addSurveyParticipant(surveyId, systemUserId, surveyJobId);
  }

  async insertSurveyParticipantRole(surveyId: number, surveyJobRole: string): Promise<void> {
    return this.surveyParticipationRepository.insertSurveyParticipantRole(surveyId, surveyJobRole);
  }
}
