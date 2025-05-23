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
   * Ignore one or more checklist items for the given survey
   *
   * @param {number} surveyId
   * @param {string[]} checklistItemNames
   * @return {*}  Promise<void>
   * @memberof SurveyChecklistService
   */
  async insertSurveyChecklistItemIgnore(surveyId: number, checklistItemNames: string[]): Promise<void> {
    await Promise.all(
      checklistItemNames.map((checklistItemName) =>
        this.surveyChecklistRepository.insertSurveyChecklistItemIgnore(surveyId, checklistItemName)
      )
    );
  }

  /**
   * Remove an ignored checklist item for the given survey
   *
   * @param {number} surveyId
   * @param {string} checklistItemName
   * @return {*}  Promise<void>
   * @memberof SurveyChecklistService
   */
  async deleteSurveyChecklistItemIgnore(surveyId: number, checklistItemName: string): Promise<void> {
    return this.surveyChecklistRepository.deleteSurveyChecklistItemIgnore(surveyId, checklistItemName);
  }
}
