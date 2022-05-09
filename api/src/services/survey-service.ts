import SQL from 'sql-template-strings';
import { HTTP400 } from '../errors/custom-error';
import {
  // GetAncillarySpeciesData,
  // GetFocalSpeciesData,
  ParsedSpeciesIds,
  GetPermitData,
  GetSpeciesData,
  GetSurveyData,
  // GetViewSurveyDetailsData,
  SurveyObject
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

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new HTTP400('Failed to get project data');
    }

    return new GetSurveyData(result);
  }

  async getSpeciesData(surveyId: number): Promise<any> {
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

    //parse result into focal and ancillary species

    const speciesIds = new ParsedSpeciesIds(result);

    const taxonomyService = new TaxonomyService();

    const focal_species_result = await taxonomyService.getSpeciesFromIds(speciesIds.focal_species);
    const ancillary_species_result = await taxonomyService.getSpeciesFromIds(speciesIds.ancillary_species);

    //parse

    return [focal_species_result, ancillary_species_result];

    //return new GetSpeciesData(species);
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

  // async getSurveyFocalSpeciesDataForView(surveyId: number): Promise<GetFocalSpeciesData> {
  //   const sqlStatement = queries.survey.getSurveyFocalSpeciesDataForViewSQL(surveyId);

  //   if (!sqlStatement) {
  //     throw new HTTP400('Failed to build SQL get statement');
  //   }

  //   const response = await this.connection.query(sqlStatement.text, sqlStatement.values);
  //   const result = (response && response.rows) || null;

  //   if (!result) {
  //     throw new HTTP400('Failed to get focal species data');
  //   }

  //   const taxonomyService = new TaxonomyService();

  //   const species = await taxonomyService.getSpeciesFromIds(result);

  //   return new GetFocalSpeciesData(species);
  // }

  // async getSurveyAncillarySpeciesDataForView(surveyId: number): Promise<GetAncillarySpeciesData> {
  //   const sqlStatement = queries.survey.getSurveyAncillarySpeciesDataForViewSQL(surveyId);

  //   if (!sqlStatement) {
  //     throw new HTTP400('Failed to build SQL get statement');
  //   }

  //   const response = await this.connection.query(sqlStatement.text, sqlStatement.values);
  //   const result = (response && response.rows) || null;

  //   if (!result) {
  //     throw new HTTP400('Failed to get ancillary species data');
  //   }

  //   const taxonomyService = new TaxonomyService();

  //   const species = await taxonomyService.getSpeciesFromIds(result);

  //   return new GetAncillarySpeciesData(species);
  // }

  // export const getSurveyBasicDataForView = async (surveyId: number, connection: IDBConnection): Promise<object> => {
  //   const sqlStatement = queries.survey.getSurveyBasicDataForViewSQL(surveyId);

  //   if (!sqlStatement) {
  //     throw new HTTP400('Failed to build SQL get statement');
  //   }

  //   const response = await connection.query(sqlStatement.text, sqlStatement.values);

  //   if (!response || !response?.rows?.[0]) {
  //     throw new HTTP400('Failed to get survey basic data');
  //   }

  //   return (response && response.rows?.[0]) || null;
  // };

  // export const getSurveyFocalSpeciesDataForView = async (
  //   surveyId: number,
  //   connection: IDBConnection
  // ): Promise<GetFocalSpeciesData> => {
  //   const sqlStatement = queries.survey.getSurveyFocalSpeciesDataForViewSQL(surveyId);

  //   if (!sqlStatement) {
  //     throw new HTTP400('Failed to build SQL get statement');
  //   }

  //   const response = await connection.query(sqlStatement.text, sqlStatement.values);
  //   const result = (response && response.rows) || null;

  //   if (!result) {
  //     throw new HTTP400('Failed to get species data');
  //   }

  //   const taxonomyService = new TaxonomyService();

  //   const species = await taxonomyService.getSpeciesFromIds(result);

  //   return new GetFocalSpeciesData(species);
  // };

  // export const getSurveyAncillarySpeciesDataForView = async (
  //   surveyId: number,
  //   connection: IDBConnection
  // ): Promise<GetAncillarySpeciesData> => {
  //   const sqlStatement = queries.survey.getSurveyAncillarySpeciesDataForViewSQL(surveyId);

  //   if (!sqlStatement) {
  //     throw new HTTP400('Failed to build SQL get statement');
  //   }

  //   const response = await connection.query(sqlStatement.text, sqlStatement.values);
  //   const result = (response && response.rows) || null;

  //   if (!result) {
  //     throw new HTTP400('Failed to get species data');
  //   }

  //   const taxonomyService = new TaxonomyService();

  //   const species = await taxonomyService.getSpeciesFromIds(result);

  //   return new GetAncillarySpeciesData(species);
  // };

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
      survey_details: GetSurveyData;
      species: GetSpeciesData;
    }[]
  > {
    return Promise.all(surveyIds.map(async (surveyId) => this.getSurveyById(surveyId)));
  }
}
