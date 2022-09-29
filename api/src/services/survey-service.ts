import SQL from 'sql-template-strings';
import { ApiGeneralError } from '../errors/custom-error';
import { PostProprietorData, PostSurveyObject } from '../models/survey-create';
import { PutSurveyObject } from '../models/survey-update';
import {
  GetAncillarySpeciesData,
  GetAttachmentsData,
  GetFocalSpeciesData,
  GetPermitData,
  GetReportAttachmentsData,
  GetSurveyData,
  GetSurveyFundingSources,
  GetSurveyLocationData,
  GetSurveyProprietorData,
  GetSurveyPurposeAndMethodologyData,
  SurveyObject,
  SurveySupplementaryData
} from '../models/survey-view';
import { queries } from '../queries/queries';
import { PermitService } from './permit-service';
import { DBService } from './service';
import { TaxonomyService } from './taxonomy-service';

export class SurveyService extends DBService {
  async getSurveyIdsByProjectId(projectId: number): Promise<{ id: number }[]> {
    const sqlStatement = queries.survey.getSurveyIdsSQL(projectId);

    const response = await this.connection.sql<{ id: number }>(sqlStatement);

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
      locationData
    ] = await Promise.all([
      this.getSurveyData(surveyId),
      this.getSpeciesData(surveyId),
      this.getPermitData(surveyId),
      this.getSurveyFundingSourcesData(surveyId),
      this.getSurveyPurposeAndMethodology(surveyId),
      this.getSurveyProprietorDataForView(surveyId),
      this.getSurveyLocationData(surveyId)
    ]);

    return {
      survey_details: surveyData,
      species: speciesData,
      permit: permitData,
      purpose_and_methodology: purposeAndMethodologyData,
      funding: fundingData,
      proprietor: proprietorData,
      location: locationData
    };
  }

  async getSurveySupplementaryDataById(surveyId: number): Promise<SurveySupplementaryData> {
    const [occurrenceSubmissionId, summaryResultId] = await Promise.all([
      this.getOccurrenceSubmissionId(surveyId),
      this.getSummaryResultId(surveyId)
    ]);

    return {
      occurrence_submission: occurrenceSubmissionId,
      summary_result: summaryResultId
    };
  }

  async getSurveyData(surveyId: number): Promise<GetSurveyData> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        survey
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement);

    const result = response.rows?.[0] || null;

    if (!result) {
      throw new ApiGeneralError('Failed to get project survey details data');
    }

    return new GetSurveyData(result);
  }

  async getSpeciesData(surveyId: number): Promise<GetFocalSpeciesData & GetAncillarySpeciesData> {
    const sqlStatement = SQL`
      SELECT
        wldtaxonomic_units_id,
        is_focal
      FROM
        study_species
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.query<{ wldtaxonomic_units_id: string; is_focal: boolean }>(
      sqlStatement.text,
      sqlStatement.values
    );

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiGeneralError('Failed to get survey species data');
    }

    const focalSpeciesIds = response.rows.filter((item) => item.is_focal).map((item) => item.wldtaxonomic_units_id);
    const ancillarySpeciesIds = response.rows
      .filter((item) => !item.is_focal)
      .map((item) => item.wldtaxonomic_units_id);

    const taxonomyService = new TaxonomyService();

    const focalSpecies = await taxonomyService.getSpeciesFromIds(focalSpeciesIds);
    const ancillarySpecies = await taxonomyService.getSpeciesFromIds(ancillarySpeciesIds);

    return { ...new GetFocalSpeciesData(focalSpecies), ...new GetAncillarySpeciesData(ancillarySpecies) };
  }

  async getPermitData(surveyId: number): Promise<GetPermitData> {
    const permitService = new PermitService(this.connection);

    const result = await permitService.getPermitBySurveyId(surveyId);

    return new GetPermitData(result);
  }

  async getSurveyPurposeAndMethodology(surveyId: number): Promise<GetSurveyPurposeAndMethodologyData> {
    const sqlStatement = queries.survey.getSurveyPurposeAndMethodologyForUpdateSQL(surveyId);

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows[0]) || null;

    if (!result) {
      throw new ApiGeneralError('Failed to get survey purpose and methodology data');
    }

    return new GetSurveyPurposeAndMethodologyData(result);
  }

  async getSurveyFundingSourcesData(surveyId: number): Promise<GetSurveyFundingSources> {
    const sqlStatement = queries.survey.getSurveyFundingSourcesDataForViewSQL(surveyId);
    if (!sqlStatement) {
      throw new ApiGeneralError('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiGeneralError('Failed to get survey funding sources data');
    }

    return new GetSurveyFundingSources(result);
  }

  async getSurveyProprietorDataForView(surveyId: number): Promise<GetSurveyProprietorData | null> {
    const sqlStatement = queries.survey.getSurveyProprietorForUpdateSQL(surveyId);

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response.rows?.[0]) {
      return null;
    }

    return new GetSurveyProprietorData(response.rows?.[0]);
  }

  async getSurveyLocationData(surveyId: number): Promise<GetSurveyLocationData> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        survey
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement);

    const result = response.rows?.[0] || null;

    if (!result) {
      throw new ApiGeneralError('Failed to get project survey details data');
    }

    return new GetSurveyLocationData(result);
  }

  async getOccurrenceSubmissionId(surveyId: number) {
    const sqlStatement = queries.survey.getLatestOccurrenceSubmissionIdSQL(surveyId);
    if (!sqlStatement) {
      throw new ApiGeneralError('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    return (response && response.rows?.[0]) || null;
  }

  /**
   * Get latest survey data submission from id
   *
   * @param {number} surveyId
   * @return {*}
   * @memberof SurveyService
   */
  async getLatestSurveyOccurrenceSubmission(surveyId: number) {
    const sqlStatement = queries.survey.getLatestSurveyOccurrenceSubmissionSQL(surveyId);
    if (!sqlStatement) {
      throw new ApiGeneralError('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    return (response && response.rows?.[0]) || null;
  }

  async getSummaryResultId(surveyId: number) {
    const sqlStatement = queries.survey.getLatestSummaryResultIdSQL(surveyId);

    if (!sqlStatement) {
      throw new ApiGeneralError('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    return (response && response.rows?.[0]) || null;
  }

  /**
   * Get surveys by their ids.
   *
   * @param {number[]} surveyIds
   * @return {*}  {Promise<SurveyObject[]>}
   * @memberof SurveyService
   */
  async getSurveysByIds(surveyIds: number[]): Promise<SurveyObject[]> {
    return Promise.all(surveyIds.map(async (surveyId) => this.getSurveyById(surveyId)));
  }

  async createSurvey(projectId: number, postSurveyData: PostSurveyObject): Promise<number> {
    const surveyId = await this.insertSurveyData(projectId, postSurveyData);

    const promises: Promise<any>[] = [];

    // Handle focal species associated to this survey
    promises.push(
      Promise.all(
        postSurveyData.species.focal_species.map((speciesId: number) => this.insertFocalSpecies(speciesId, surveyId))
      )
    );

    // Handle ancillary species associated to this survey
    promises.push(
      Promise.all(
        postSurveyData.species.ancillary_species.map((speciesId: number) =>
          this.insertAncillarySpecies(speciesId, surveyId)
        )
      )
    );

    // Handle inserting any permit associated to this survey
    const permitService = new PermitService(this.connection);
    promises.push(
      Promise.all(
        postSurveyData.permit.permits.map((permit) =>
          permitService.createSurveyPermit(surveyId, permit.permit_number, permit.permit_type)
        )
      )
    );

    // Handle inserting any funding sources associated to this survey
    promises.push(
      Promise.all(
        postSurveyData.funding.funding_sources.map((fsId: number) => this.insertSurveyFundingSource(fsId, surveyId))
      )
    );

    // Handle survey proprietor data
    postSurveyData.proprietor && promises.push(this.insertSurveyProprietor(postSurveyData.proprietor, surveyId));

    //Handle vantage codes associated to this survey
    promises.push(
      Promise.all(
        postSurveyData.purpose_and_methodology.vantage_code_ids.map((vantageCode: number) =>
          this.insertVantageCodes(vantageCode, surveyId)
        )
      )
    );

    await Promise.all(promises);

    return surveyId;
  }

  async getAttachmentsData(surveyId: number): Promise<GetAttachmentsData> {
    const sqlStatement = queries.survey.getAttachmentsBySurveySQL(surveyId);

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows) || null;

    return new GetAttachmentsData(result);
  }

  async getReportAttachmentsData(surveyId: number): Promise<GetReportAttachmentsData> {
    const sqlStatement = queries.survey.getReportAttachmentsBySurveySQL(surveyId);

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows) || null;

    return new GetReportAttachmentsData(result);
  }

  async insertSurveyData(projectId: number, surveyData: PostSurveyObject): Promise<number> {
    const sqlStatement = queries.survey.postSurveySQL(projectId, surveyData);

    const response = await this.connection.sql(sqlStatement);
    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiGeneralError('Failed to insert survey data');
    }

    return result.id;
  }

  async insertFocalSpecies(focal_species_id: number, surveyId: number): Promise<number> {
    const sqlStatement = queries.survey.postFocalSpeciesSQL(focal_species_id, surveyId);

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new ApiGeneralError('Failed to insert focal species data');
    }

    return result.id;
  }

  async insertAncillarySpecies(ancillary_species_id: number, surveyId: number): Promise<number> {
    const sqlStatement = queries.survey.postAncillarySpeciesSQL(ancillary_species_id, surveyId);

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new ApiGeneralError('Failed to insert ancillary species data');
    }

    return result.id;
  }

  async insertVantageCodes(vantage_code_id: number, surveyId: number): Promise<number> {
    const sqlStatement = queries.survey.postVantageCodesSQL(vantage_code_id, surveyId);

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new ApiGeneralError('Failed to insert ancillary species data');
    }

    return result.id;
  }

  async insertSurveyProprietor(survey_proprietor: PostProprietorData, surveyId: number): Promise<number | undefined> {
    if (!survey_proprietor.survey_data_proprietary) {
      return;
    }

    const sqlStatement = queries.survey.postSurveyProprietorSQL(surveyId, survey_proprietor);

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new ApiGeneralError('Failed to insert survey proprietor data');
    }

    return result.id;
  }

  async insertOrAssociatePermitToSurvey(
    systemUserId: number,
    projectId: number,
    surveyId: number,
    permitNumber: string,
    permitType: string
  ) {
    let sqlStatement;

    if (!permitType) {
      sqlStatement = queries.survey.associateSurveyToPermitSQL(projectId, surveyId, permitNumber);
    } else {
      sqlStatement = queries.survey.insertSurveyPermitSQL(systemUserId, projectId, surveyId, permitNumber, permitType);
    }

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiGeneralError('Failed to upsert survey permit record');
    }
  }

  async insertSurveyFundingSource(funding_source_id: number, surveyId: number) {
    const sqlStatement = queries.survey.insertSurveyFundingSourceSQL(surveyId, funding_source_id);

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new ApiGeneralError('Failed to insert survey funding source data');
    }
  }

  async updateSurvey(surveyId: number, putSurveyData: PutSurveyObject): Promise<void> {
    const promises: Promise<any>[] = [];

    if (putSurveyData?.survey_details || putSurveyData?.purpose_and_methodology || putSurveyData?.location) {
      promises.push(this.updateSurveyDetailsData(surveyId, putSurveyData));
    }

    if (putSurveyData?.purpose_and_methodology) {
      promises.push(this.updateSurveyVantageCodesData(surveyId, putSurveyData));
    }

    if (putSurveyData?.species) {
      promises.push(this.updateSurveySpeciesData(surveyId, putSurveyData));
    }

    if (putSurveyData?.permit) {
      promises.push(this.updateSurveyPermitData(surveyId, putSurveyData));
    }

    if (putSurveyData?.funding) {
      promises.push(this.updateSurveyFundingData(surveyId, putSurveyData));
    }

    if (putSurveyData?.proprietor) {
      promises.push(this.updateSurveyProprietorData(surveyId, putSurveyData));
    }

    await Promise.all(promises);
  }

  async updateSurveyDetailsData(surveyId: number, surveyData: PutSurveyObject) {
    const updateSurveyQueryBuilder = queries.survey.putSurveyDetailsSQL(surveyId, surveyData);

    const result = await this.connection.knex(updateSurveyQueryBuilder);

    if (!result || !result.rowCount) {
      throw new ApiGeneralError('Failed to update survey data');
    }
  }

  async updateSurveySpeciesData(surveyId: number, surveyData: PutSurveyObject) {
    this.deleteSurveySpeciesData(surveyId);

    const promises: Promise<any>[] = [];

    surveyData.species.focal_species.forEach((focalSpeciesId: number) =>
      promises.push(this.insertFocalSpecies(focalSpeciesId, surveyId))
    );

    surveyData.species.ancillary_species.forEach((ancillarySpeciesId: number) =>
      promises.push(this.insertAncillarySpecies(ancillarySpeciesId, surveyId))
    );

    return Promise.all(promises);
  }

  async deleteSurveySpeciesData(surveyId: number) {
    const sqlStatement = queries.survey.deleteAllSurveySpeciesSQL(surveyId);

    return this.connection.sql(sqlStatement);
  }

  /**
   * Compares incoming survey permit data against the existing survey permits, if any, and determines which need to be
   * deleted, added, or updated.
   *
   * @param {number} surveyId
   * @param {PutSurveyObject} surveyData
   * @memberof SurveyService
   */
  async updateSurveyPermitData(surveyId: number, surveyData: PutSurveyObject) {
    const permitService = new PermitService(this.connection);

    // Get any existing permits for this survey
    const existingPermits = await permitService.getPermitBySurveyId(surveyId);

    // Compare the array of existing permits to the array of incoming permits (by permit id) and collect any
    // existing permits that are not in the incoming permit array.
    const existingPermitsToDelete = existingPermits.filter((existingPermit) => {
      // Find all existing permits (by permit id) that have no matching incoming permit id
      return !surveyData.permit.permits.find((incomingPermit) => incomingPermit.permit_id === existingPermit.permit_id);
    });

    // Delete from the database all existing survey permits that have been removed
    if (existingPermitsToDelete.length) {
      const promises: Promise<any>[] = [];

      existingPermitsToDelete.forEach((permit) => {
        promises.push(permitService.deleteSurveyPermit(surveyId, permit.permit_id));
      });

      await Promise.all(promises);
    }

    // The remaining permits are either new, and can be created, or updates to existing permits
    const promises: Promise<any>[] = [];

    surveyData.permit.permits.forEach((permit) => {
      if (permit.permit_id) {
        // Has a permit_id, indicating this is an update to an existing permit
        promises.push(
          permitService.updateSurveyPermit(surveyId, permit.permit_id, permit.permit_number, permit.permit_type)
        );
      } else {
        // No permit_id, indicating this is a new permit which needs to be created
        promises.push(permitService.createSurveyPermit(surveyId, permit.permit_number, permit.permit_type));
      }
    });

    return Promise.all(promises);
  }

  async unassociatePermitFromSurvey(surveyId: number) {
    const sqlStatement = queries.survey.unassociatePermitFromSurveySQL(surveyId);

    return this.connection.sql(sqlStatement);
  }

  async updateSurveyFundingData(surveyId: number, surveyData: PutSurveyObject) {
    await this.deleteSurveyFundingSourcesData(surveyId);

    const promises: Promise<any>[] = [];

    surveyData.funding.funding_sources.forEach((fsId: number) =>
      promises.push(this.insertSurveyFundingSource(fsId, surveyId))
    );

    return Promise.all(promises);
  }

  async deleteSurveyFundingSourcesData(surveyId: number) {
    const sqlStatement = queries.survey.deleteSurveyFundingSourcesBySurveyIdSQL(surveyId);

    return this.connection.sql(sqlStatement);
  }

  async updateSurveyProprietorData(surveyId: number, surveyData: PutSurveyObject) {
    await this.deleteSurveyProprietorData(surveyId);

    if (!surveyData.proprietor.survey_data_proprietary) {
      return;
    }

    return this.insertSurveyProprietor(surveyData.proprietor, surveyId);
  }

  async deleteSurveyProprietorData(surveyId: number) {
    const sqlStatement = queries.survey.deleteSurveyProprietorSQL(surveyId);

    return this.connection.sql(sqlStatement);
  }

  async updateSurveyVantageCodesData(surveyId: number, surveyData: PutSurveyObject) {
    await this.deleteSurveyVantageCodes(surveyId);

    const promises: Promise<number>[] = [];

    if (surveyData.purpose_and_methodology.vantage_code_ids) {
      surveyData.purpose_and_methodology.vantage_code_ids.forEach((vantageCodeId: number) =>
        promises.push(this.insertVantageCodes(vantageCodeId, surveyId))
      );
    }

    return Promise.all(promises);
  }

  async deleteSurveyVantageCodes(surveyId: number) {
    const sqlStatement = queries.survey.deleteSurveyVantageCodesSQL(surveyId);

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new ApiGeneralError('Failed to delete survey vantage codes');
    }
  }
}
