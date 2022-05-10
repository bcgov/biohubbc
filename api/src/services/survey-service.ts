import SQL from 'sql-template-strings';
import { HTTP400 } from '../errors/custom-error';
import {
  ParsedSpeciesIds,
  GetPermitData,
  GetSurveyData,
  SurveyObject,
  GetFocalSpeciesData,
  GetAncillarySpeciesData
} from '../models/survey-view';
import { GetSurveyPurposeAndMethodologyData } from '../models/survey-view-update';
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
    const [
      surveyData,
      speciesData,
      permitData,
      fundingData,
      purposeAndMethodologyData,
      proprietorData,
      occurrenceSubmissionId,
      summaryResultId
    ] = await Promise.all([
      this.getSurveyData(surveyId),
      this.getSpeciesData(surveyId),
      this.getPermitData(surveyId),
      this.getSurveyFundingSourcesData(surveyId),
      this.getSurveyPurposeAndMethodology(surveyId),
      this.getSurveyProprietorDataForView(surveyId),
      this.getOccurrenceSubmissionId(surveyId),
      this.getSummaryResultId(surveyId)
    ]);

    return {
      survey_details: surveyData,
      species: speciesData,
      permit: permitData,
      purpose_and_methodology: purposeAndMethodologyData,
      funding_sources: fundingData,
      proprietor: proprietorData,
      occurrence_submission: occurrenceSubmissionId,
      summary_result: summaryResultId
    };
  }

  async getSurveyData(surveyId: number): Promise<GetSurveyData> {
    const sqlStatement = queries.survey.getSurveySQL(surveyId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response?.rows.length && new GetSurveyData(response.rows[0])) || null;

    if (!result) {
      throw new HTTP400('Failed to get project survey details data');
    }

    return result;
  }

  async getSpeciesData(surveyId: number): Promise<GetFocalSpeciesData & GetAncillarySpeciesData> {
    const sqlStatement = SQL`
      SELECT
        wldtaxonomic_units_id, is_focal
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

    //parse result from DB into focal and ancillary species
    const parsedSpeciesIds = new ParsedSpeciesIds(result);

    const taxonomyService = new TaxonomyService();

    const focal_species_result = await taxonomyService.getSpeciesFromIds(parsedSpeciesIds.focal_species);
    const ancillary_species_result = await taxonomyService.getSpeciesFromIds(parsedSpeciesIds.ancillary_species);

    const focal_species = new GetFocalSpeciesData(focal_species_result);
    const ancillary_species = new GetAncillarySpeciesData(ancillary_species_result);

    return {
      focal_species: focal_species.focal_species,
      focal_species_names: focal_species.focal_species_names,
      ancillary_species: ancillary_species.ancillary_species,
      ancillary_species_names: ancillary_species.ancillary_species_names
    };
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

    const result = (response && response.rows[0]) || null;

    console.log('permit result : ', result);

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

    return (response && response.rows && new GetSurveyPurposeAndMethodologyData(response.rows)[0]) || null;
  }

  async getSurveyFundingSourcesData(surveyId: number): Promise<any[]> {
    const sqlStatement = queries.survey.getSurveyFundingSourcesDataForViewSQL(surveyId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to get survey funding sources data');
    }

    return (response && response.rows) || null;
  }

  async getSurveyProprietorDataForView(surveyId: number) {
    const sqlStatement = queries.survey.getSurveyProprietorForUpdateSQL(surveyId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    return (response && response.rows?.[0]) || null;
  }

  async getOccurrenceSubmissionId(surveyId: number) {
    const sqlStatement = queries.survey.getLatestOccurrenceSubmissionIdSQL(surveyId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    return (response && response.rows?.[0]) || null;
  }

  async getSummaryResultId(surveyId: number) {
    const sqlStatement = queries.survey.getLatestSummaryResultIdSQL(surveyId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    return (response && response.rows?.[0]) || null;
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
  async getSurveysByIds(surveyIds: number[]): Promise<SurveyObject[]> {
    return Promise.all(surveyIds.map(async (surveyId) => this.getSurveyById(surveyId)));
  }
}
