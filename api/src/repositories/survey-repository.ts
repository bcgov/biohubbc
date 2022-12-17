import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export class SurveyRepository extends BaseRepository {
  async deleteSurvey(surveyId: number): Promise<void> {
    const sqlStatement = SQL`call api_delete_survey(${surveyId})`;

    const response = await this.connection.sql(sqlStatement);

    if (!response) {
      throw new ApiExecuteSQLError('Failed to delete Survey', [
        'SurveyRepository->deleteSurvey',
        'response was null or undefined, expected response != null'
      ]);
    }
  }
}
