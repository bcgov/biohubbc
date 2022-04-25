import SQL from 'sql-template-strings';
import { HTTP400 } from '../errors/custom-error';
import { GetSpeciesData, GetSurveyData, SurveyObject } from '../models/survey-view';
import { queries } from '../queries/queries';
import { DBService } from './service';
import { TaxonomyService } from './taxonomy-service';

export class SurveyService extends DBService {
  async getSurveyIdsByProjectId(projectId: number): Promise<any> {
    const sqlStatement = queries.survey.getSurveyIdsSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL select statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response.rows) {
      return [];
    }

    return response.rows;
  }

  async getSurveyById(surveyId: number): Promise<SurveyObject> {
    const [surveyData, speciesData] = await Promise.all([this.getSurveyData(surveyId), this.getSpeciesData(surveyId)]);

    return {
      survey: surveyData,
      species: speciesData
    };
  }

  async getSurveyData(surveyId: number): Promise<GetSurveyData> {
    const sqlStatement = queries.survey.getSurveySQL(surveyId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new HTTP400('Failed to get project data');
    }

    return new GetSurveyData(result);
  }

  async getSpeciesData(surveyId: number): Promise<GetSpeciesData> {
    const sqlStatement = SQL`
      SELECT
        wldtaxonomic_units_id
      FROM
        study_species
      WHERE
        survey_id = ${surveyId};
      `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get species data');
    }

    const taxonomyService = new TaxonomyService();

    const species = await taxonomyService.getSpeciesFromIds(result);

    return new GetSpeciesData(species);
  }

  /**
   * Get surveys by their ids.
   *
   * @param {number[]} surveyIds
   * @param {boolean} [isPublic=false] Set to `true` if the return value should not include data that is not meant for
   * public consumption.
   * @return {*}  {Promise<
   *     {
   *       survey: GetSurveyData;
   *       species: GetSpeciesData;
   *     }[]
   *   >}
   * @memberof SurveyService
   */
  async getSurveysByIds(
    surveyIds: number[]
  ): Promise<
    {
      survey: GetSurveyData;
      species: GetSpeciesData;
    }[]
  > {
    return Promise.all(surveyIds.map(async (surveyId) => this.getSurveyById(surveyId)));
  }
}
