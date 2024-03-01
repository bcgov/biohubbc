import { IDBConnection } from '../database/db';
import { SurveyJob, SurveyParticipationRepository, SurveyUser } from '../repositories/survey-participation-repository';
import { SystemUser } from '../repositories/user-repository';
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

  async getSurveyParticipant(surveyId: number, systemUserId: number): Promise<(SurveyUser & SystemUser) | null> {
    return this.surveyParticipationRepository.getSurveyParticipant(surveyId, systemUserId);
  }

  async getSurveyParticipants(surveyId: number): Promise<(SurveyUser & SystemUser)[]> {
    return this.surveyParticipationRepository.getSurveyParticipants(surveyId);
  }

  async insertSurveyParticipant(surveyId: number, systemUserId: number, surveyJobName: string): Promise<void> {
    return this.surveyParticipationRepository.insertSurveyParticipant(surveyId, systemUserId, surveyJobName);
  }

  async updateSurveyParticipantJob(surveyId: number, surveyParticipationId: number, surveyJobName: string): Promise<void> {
    return this.surveyParticipationRepository.updateSurveyParticipantJob(surveyId, surveyParticipationId, surveyJobName);
  }

  async deleteSurveyParticipationRecord(surveyId: number, surveyParticipationId: number): Promise<any> {
    return this.surveyParticipationRepository.deleteSurveyParticipationRecord(surveyId, surveyParticipationId);
  }
}
