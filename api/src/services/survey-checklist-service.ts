import { IDBConnection } from '../database/db';
import { SurveyChecklist, SurveyChecklistRepository } from '../repositories/survey-checklist-repository';
import { DBService } from './db-service';

export class SurveyChecklistService extends DBService {
  surveyChecklistRepository: SurveyChecklistRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.surveyChecklistRepository = new SurveyChecklistRepository(connection);
  }

  /**
   * Get survey checklist by survey Id
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyChecklist>}
   * @memberof SurveyService
   */
  async getSurveyChecklist(surveyId: number): Promise<SurveyChecklist> {
    return this.surveyChecklistRepository.getSurveyChecklist(surveyId);
  }

  /**
   * Ignore a checklist item for the given survey
   *
   * @param {number} surveyId
   * @param {number} checklistItemId
   * @return {*}  Promise<void>
   * @memberof SurveyChecklistService
   */
  async insertSurveyChecklistItemIgnore(surveyId: number, checklistItemId: number): Promise<void> {
    return this.surveyChecklistRepository.insertSurveyChecklistItemIgnore(surveyId, checklistItemId);
  }
}
