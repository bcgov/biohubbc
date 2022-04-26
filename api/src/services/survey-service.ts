import SQL from 'sql-template-strings';
import { HTTP400 } from '../errors/custom-error';

import {
  GetSpeciesData,
  GetPermitData,
  GetSurveyData,
  SurveyObject,
  GetSurveyFundingSources
} from '../models/survey-view';
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
    const [surveyData, speciesData, permitData, purposeAndMethodologyData, fundingData] = await Promise.all([
      this.getSurveyData(surveyId),
      this.getSpeciesData(surveyId),
      this.getPermitData(surveyId),
      this.getSurveyPurposeAndMethodology(surveyId),
      this.getSurveyFundingSourcesData(surveyId)
    ]);

    return {
      survey: surveyData,
      species: speciesData,
      permit: permitData,
      purposeAndMethodology: purposeAndMethodologyData,
      funding_sources: fundingData
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

  async getPermitData(surveyId: number): Promise<GetPermitData> {
    const sqlStatement = SQL`
      SELECT
        number, type
      FROM
        permit
      WHERE
        survey_id = ${surveyId};
      `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get permit data');
    }

    return new GetPermitData(result);
  }

  async getSurveyPurposeAndMethodology(surveyId: number): Promise<object> {
    const sqlStatement = queries.survey.getSurveyPurposeAndMethodologyForUpdateSQL(surveyId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response?.rows?.[0]) {
      throw new HTTP400('Failed to get survey purpose and methodology data');
    }

    return (response && response.rows) || [];
  }

  async getSurveyFundingSourcesData(surveyId: number): Promise<GetSurveyFundingSources[]> {
    const sqlStatement = queries.survey.getSurveyFundingSourcesDataForViewSQL(surveyId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to get survey funding sources data');
    }

    return (response && response.rows) || [];
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
