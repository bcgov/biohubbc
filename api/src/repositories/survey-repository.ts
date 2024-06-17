import { Knex } from 'knex';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { PostProprietorData, PostSurveyObject } from '../models/survey-create';
import { PutSurveyObject } from '../models/survey-update';
import {
  GetAttachmentsData,
  GetReportAttachmentsData,
  GetSurveyProprietorData,
  GetSurveyPurposeAndMethodologyData,
  ISurveyAdvancedFilters,
  SurveyListData
} from '../models/survey-view';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';

export interface IGetSpeciesData {
  itis_tsn: number;
  is_focal: boolean;
}

export interface IObservationSubmissionInsertDetails {
  surveyId: number;
  source: string;
  inputFileName?: string;
  inputKey?: string;
  outputFileName?: string;
  outputKey?: string;
}

export interface IObservationSubmissionUpdateDetails {
  submissionId: number;
  inputFileName?: string;
  inputKey?: string;
  outputFileName?: string;
  outputKey?: string;
}

export interface ISurveyProprietorModel {
  first_nations_id: number;
  proprietor_type_id: number;
  survey_id: number;
  rational: string;
  proprietor_name: string;
  disa_required: boolean;
}

const SurveyRecord = z.object({
  survey_id: z.number(),
  project_id: z.number(),
  field_method_id: z.number().nullable(),
  uuid: z.string().uuid().nullable(),
  name: z.string().nullable(),
  additional_details: z.string().nullable(),
  start_date: z.string(),
  lead_first_name: z.string().nullable(),
  lead_last_name: z.string().nullable(),
  end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number(),
  ecological_season_id: z.number().nullable(),
  comments: z.string().nullable(),
  progress_id: z.number()
});

export type SurveyRecord = z.infer<typeof SurveyRecord>;

const SurveyTypeRecord = z.object({
  survey_type_id: z.number(),
  survey_id: z.number(),
  type_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyTypeRecord = z.infer<typeof SurveyTypeRecord>;

export const StakeholderPartnershipRecord = z.object({
  survey_stakeholder_partnership_id: z.number(),
  survey_id: z.number(),
  name: z.string()
});

export const IndigenousPartnershipRecord = z.object({
  survey_first_nation_partnership_id: z.number(),
  survey_id: z.number(),
  first_nations_id: z.number()
});

export type StakeholderPartnershipRecord = z.infer<typeof StakeholderPartnershipRecord>;

export type IndigenousPartnershipRecord = z.infer<typeof IndigenousPartnershipRecord>;

export const SurveyProgressRecord = z.object({
  survey_progress_id: z.number(),
  name: z.string(),
  description: z.string()
});

export type SurveyProgressRecord = z.infer<typeof SurveyProgressRecord>;

export const SurveyBasicFields = z.object({
  survey_id: z.number(),
  name: z.string(),
  start_date: z.string(),
  end_date: z.string().nullable(),
  progress_id: z.number(),
  focal_species: z.array(z.number()),
  focal_species_names: z.array(z.string())
});

export type SurveyBasicFields = z.infer<typeof SurveyBasicFields>;

export class SurveyRepository extends BaseRepository {
  /**
   * Deletes a survey and any associations for a given survey
   *
   * @param {number} surveyId
   * @memberof SurveyRepository
   */
  async deleteSurvey(surveyId: number): Promise<void> {
    const sqlStatement = SQL`call api_delete_survey(${surveyId})`;

    await this.connection.sql(sqlStatement);
  }

  /**
   * Constructs a non-paginated query used to get a list of surveys based on the user's permissions and search criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ISurveyAdvancedFilters} filterFields
   * @return {*}  Promise<Knex.QueryBuilder>
   * @memberof SurveyRepository
   */
  _makeFindSurveysQuery(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ISurveyAdvancedFilters
  ): Knex.QueryBuilder {
    const knex = getKnex();

    const query = knex
      .select([
        's.survey_id',
        's.project_id',
        's.name',
        's.progress_id',
        's.start_date',
        's.end_date',
        knex.raw(`COALESCE(array_remove(array_agg(DISTINCT rl.region_name), null), '{}') as regions`),
        knex.raw('array_remove(array_agg(distinct sp.itis_tsn), null) as focal_species'),
        knex.raw('array_remove(array_agg(distinct st.type_id), null) as types')
      ])
      .from('survey as s')
      .leftJoin('project as p', 'p.project_id', 's.project_id')
      .leftJoin('study_species as sp', 'sp.survey_id', 's.survey_id')
      .leftJoin('survey_type as st', 'st.survey_id', 's.survey_id')
      .leftJoin('survey_region as sr', 'sr.survey_id', 's.survey_id')
      .leftJoin('region_lookup as rl', 'rl.region_id', 'sr.region_id')
      .leftJoin('project_participation as ppa', 'ppa.project_id', 's.project_id')
      .groupBy('s.survey_id', 's.project_id', 's.name', 's.progress_id', 's.start_date', 's.end_date');

    // Ensure that users can only see surveys that they are participating in, unless they are an administrator.
    if (!isUserAdmin) {
      query.whereIn('p.project_id', (subQueryBuilder) => {
        subQueryBuilder.select('project_id').from('project_participation').where('system_user_id', systemUserId);
      });
    }

    // Ensure that only administrators can filter surveys by other users.
    if (isUserAdmin) {
      if (filterFields.system_user_id) {
        query.whereIn('p.project_id', (subQueryBuilder) => {
          subQueryBuilder
            .select('project_id')
            .from('project_participation')
            .where('system_user_id', filterFields.system_user_id);
        });
      }
    }

    // Start Date filter
    if (filterFields.start_date) {
      query.andWhere('s.start_date', '>=', filterFields.start_date);
    }

    // End Date filter
    if (filterFields.end_date) {
      query.andWhere('s.end_date', '<=', filterFields.end_date);
    }

    // Project Name filter (like match)
    if (filterFields.survey_name) {
      query.andWhere('s.name', 'ilike', `%${filterFields.survey_name}%`);
    }

    // Focal Species filter
    if (filterFields.itis_tsns?.length) {
      // multiple
      query.whereIn('sp.itis_tsn', filterFields.itis_tsns);
    } else if (filterFields.itis_tsn) {
      // single
      query.where('sp.itis_tsn', filterFields.itis_tsn);
    }

    // Keyword Search filter
    if (filterFields.keyword) {
      const keywordMatch = `%${filterFields.keyword}%`;
      query.where((subQueryBuilder) => {
        subQueryBuilder
          .where('s.name', 'ilike', keywordMatch)
          .orWhere('s.additional_details', 'ilike', keywordMatch)
          .orWhere('s.comments', 'ilike', keywordMatch);

        // If the keyword is a number, also match on survey Id
        if (!isNaN(Number(filterFields.keyword))) {
          subQueryBuilder.orWhere('s.survey_id', Number(filterFields.keyword));
        }
      });
    }

    return query;
  }

  /**
   * Retrieves the paginated list of all surveys that are available to the user.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ISurveyAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveyListData[]>}
   * @memberof SurveyRepository
   */
  async findSurveys(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ISurveyAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyListData[]> {
    const query = this._makeFindSurveysQuery(isUserAdmin, systemUserId, filterFields);

    // Pagination
    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, SurveyListData);

    return response.rows;
  }

  /**
   * Get survey(s) for a given project id
   *
   * @param {number} projectId
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof SurveyRepository
   */
  async getSurveyIdsByProjectId(projectId: number): Promise<{ id: number }[]> {
    const sqlStatement = SQL`
      SELECT
        survey_id as id
      FROM
        survey
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.sql<{ id: number }>(sqlStatement);

    return response.rows;
  }

  /**
   * Gets a survey record for a given survey ID
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyRecord>}
   * @memberof SurveyRepository
   */
  async getSurveyData(surveyId: number): Promise<SurveyRecord> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        survey
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, SurveyRecord);

    if (!response.rows[0]) {
      throw new ApiExecuteSQLError('Failed to get project survey details data', [
        'SurveyRepository->getSurveyData',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Gets survey types records for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*}  {Promise<SurveyTypeRecord[]>}
   * @memberof SurveyRepository
   */
  async getSurveyTypesData(surveyId: number): Promise<SurveyTypeRecord[]> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        survey_type
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, SurveyTypeRecord);

    return response.rows;
  }

  /**
   * Gets survey status records for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*}  {Promise<SurveyTypeRecord[]>}
   * @memberof SurveyRepository
   */
  async getSurveyStatusData(surveyId: number): Promise<SurveyProgressRecord[]> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        survey_progress
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, SurveyProgressRecord);

    return response.rows;
  }

  /**
   * Get species data for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} {Promise<IGetSpeciesData[]>}
   * @memberof SurveyRepository
   */
  async getSpeciesData(surveyId: number): Promise<IGetSpeciesData[]> {
    const sqlStatement = SQL`
      SELECT
        itis_tsn,
        is_focal
      FROM
        study_species
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql<IGetSpeciesData>(sqlStatement);

    return response.rows;
  }

  /**
   * Deletes a survey and any associations for a given survey
   *
   * @param {number} surveyId
   * @memberof SurveyRepository
   */
  async getSurveyPurposeAndMethodology(surveyId: number): Promise<GetSurveyPurposeAndMethodologyData> {
    const sqlStatement = SQL`
      SELECT
        s.additional_details,
        array_remove(array_agg(DISTINCT io.intended_outcome_id), NULL) as intended_outcome_ids,
        array_remove(array_agg(DISTINCT sv.vantage_id), NULL) as vantage_ids

      FROM
        survey s
      LEFT OUTER JOIN
        survey_vantage sv
      ON
        sv.survey_id = s.survey_id
      LEFT OUTER JOIN
        survey_intended_outcome io
      ON
        io.survey_id = s.survey_id
      WHERE
        s.survey_id = ${surveyId}
      GROUP BY
        s.additional_details
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = response.rows?.[0];

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get survey purpose and methodology data', [
        'SurveyRepository->getSurveyPurposeAndMethodology',
        'response was null or undefined, expected response != null'
      ]);
    }

    return new GetSurveyPurposeAndMethodologyData(result);
  }

  /**
   * Get a Survey Proprietor for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} {Promise<ISurveyProprietorModel>}
   * @memberof SurveyRepository
   */
  async getSurveyProprietorDataForSecurityRequest(surveyId: number): Promise<ISurveyProprietorModel> {
    const sqlStatement = SQL`
      SELECT *
      FROM survey_proprietor as sp
      WHERE survey_id = ${surveyId};
    `;

    const response = await this.connection.sql<ISurveyProprietorModel>(sqlStatement);

    return response.rows[0];
  }

  /**
   * Get Survey Proprietor data for view for a given survey id
   *
   * @param {number} surveyId
   * @returns {*} Promise<GetSurveyProprietorData | null>
   * @memberof SurveyRepository
   */
  async getSurveyProprietorDataForView(surveyId: number): Promise<GetSurveyProprietorData | null> {
    const sqlStatement = SQL`
      SELECT
        prt.name as proprietor_type_name,
        prt.proprietor_type_id,
        fn.name as first_nations_name,
        fn.first_nations_id,
        sp.rationale as category_rationale,
        CASE
          WHEN sp.proprietor_name is not null THEN sp.proprietor_name
          WHEN fn.first_nations_id is not null THEN fn.name
        END as proprietor_name,
        sp.disa_required,
        sp.revision_count
      from
        survey_proprietor as sp
      left outer join proprietor_type as prt
        on sp.proprietor_type_id = prt.proprietor_type_id
      left outer join first_nations as fn
        on sp.first_nations_id is not null
        and sp.first_nations_id = fn.first_nations_id
      where
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement);

    const result = response.rows?.[0];

    if (!result) {
      return null;
    }

    return new GetSurveyProprietorData(result);
  }

  /**
   * Get Survey attachments data for a given surveyId
   *
   * @param {number} surveyId
   * @returns {*} Promise<GetAttachmentsData>
   * @memberof SurveyRepository
   */
  async getAttachmentsData(surveyId: number): Promise<GetAttachmentsData> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        survey_attachment
      WHERE
        survey_id = ${surveyId};
    `;
    const response = await this.connection.sql(sqlStatement);

    const result = response.rows;

    return new GetAttachmentsData(result);
  }

  /**
   * Get Survey Report attachments data for a given surveyId
   *
   * @param {number} surveyId
   * @returns {*} Promise<GetReportAttachmentsData>
   * @memberof SurveyRepository
   */
  async getReportAttachmentsData(surveyId: number): Promise<GetReportAttachmentsData> {
    const sqlStatement = SQL`
      SELECT
        pra.survey_report_attachment_id
        , pra.survey_id
        , pra.file_name
        , pra.title
        , pra.description
        , pra.year
        , pra."key"
        , pra.file_size
        , array_remove(array_agg(pra2.first_name ||' '||pra2.last_name), null) authors
      FROM
      survey_report_attachment pra
      LEFT JOIN survey_report_author pra2 ON pra2.survey_report_attachment_id = pra.survey_report_attachment_id
      WHERE pra.survey_id = ${surveyId}
      GROUP BY
        pra.survey_report_attachment_id
        , pra.survey_id
        , pra.file_name
        , pra.title
        , pra.description
        , pra.year
        , pra."key"
        , pra.file_size;
    `;

    const response = await this.connection.sql(sqlStatement);

    const result = response.rows;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get attachments data', [
        'SurveyRepository->getReportAttachmentsData',
        'response was null or undefined, expected response != null'
      ]);
    }

    return new GetReportAttachmentsData(result);
  }

  /**
   * Fetches a subset of survey fields for all surveys under a project.
   *
   * @param {number} projectId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<Omit<SurveyBasicFields, 'focal_species_names'>[]>}
   * @memberof SurveyRepository
   */
  async getSurveysBasicFieldsByProjectId(
    projectId: number,
    pagination?: ApiPaginationOptions
  ): Promise<Omit<SurveyBasicFields, 'focal_species_names'>[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .select(
        'survey.survey_id',
        'survey.name',
        'survey.start_date',
        'survey.end_date',
        'survey.progress_id',
        knex.raw('array_remove(array_agg(study_species.itis_tsn), NULL) AS focal_species')
      )
      .from('project')
      .leftJoin('survey', 'survey.project_id', 'project.project_id')
      .leftJoin('study_species', 'study_species.survey_id', 'survey.survey_id')
      .leftJoin('survey_progress', 'survey_progress.survey_progress_id', 'survey.progress_id')
      .where('project.project_id', projectId)
      .where('study_species.is_focal', true)
      .groupBy('survey.survey_id')
      .groupBy('survey.name')
      .groupBy('survey.start_date')
      .groupBy('survey.end_date')
      .groupBy('survey.progress_id');

    if (pagination) {
      queryBuilder.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        queryBuilder.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(queryBuilder, SurveyBasicFields.omit({ focal_species_names: true }));

    return response.rows;
  }

  /**
   * Returns the total number of surveys that the user has access to
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {ISurveyAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof SurveyService
   */
  async findSurveysCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ISurveyAdvancedFilters
  ): Promise<number> {
    const surveyListQuery = this._makeFindSurveysQuery(isUserAdmin, systemUserId, filterFields);

    const knex = getKnex();

    const queryBuilder = knex.from(surveyListQuery.as('slq')).select(knex.raw('count(*)::integer as count'));

    const response = await this.connection.knex(queryBuilder, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get survey count', [
        'SurveyRepository->findSurveysCount',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Returns the total number of surveys belonging to the given project.
   *
   * @param {number} projectId
   * @return {*}  {Promise<number>}
   * @memberof SurveyService
   */
  async getSurveyCountByProjectId(projectId: number): Promise<number> {
    const sqlStatement = SQL`
      SELECT
        COUNT(*)::integer AS count
      FROM
        survey
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.sql(sqlStatement, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get survey count', [
        'SurveyRepository->getSurveyCountByProjectId',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Inserts a new survey record and returns the new ID
   *
   * @param {number} projectId
   * @param {PostSurveyObject} surveyData
   * @returns {*} Promise<number>
   * @memberof SurveyRepository
   */
  async insertSurveyData(projectId: number, surveyData: PostSurveyObject): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO survey (
        project_id,
        name,
        start_date,
        end_date,
        progress_id,
        additional_details
      ) VALUES (
        ${projectId},
        ${surveyData.survey_details.survey_name},
        ${surveyData.survey_details.start_date},
        ${surveyData.survey_details.end_date},
        ${surveyData.survey_details.progress_id},
        ${surveyData.purpose_and_methodology.additional_details}
      )
      RETURNING
        survey_id as id;
    `;

    const response = await this.connection.sql(sqlStatement);
    const result = response.rows?.[0];

    if (!result) {
      throw new ApiExecuteSQLError('Failed to insert survey data', [
        'SurveyRepository->insertSurveyData',
        'response was null or undefined, expected response != null'
      ]);
    }

    return result.id;
  }

  /**
   * Inserts new survey_type records.
   *
   * @param {number[]} typeIds
   * @param {number} surveyId
   * @return {*}  {Promise<void>}
   * @memberof SurveyRepository
   */
  async insertSurveyTypes(typeIds: number[], surveyId: number): Promise<void> {
    const queryBuilder = getKnex()
      .table('survey_type')
      .insert(
        typeIds.map((typeId) => ({
          type_id: typeId,
          survey_id: surveyId
        }))
      );

    const response = await this.connection.knex(queryBuilder);

    if (response.rowCount !== typeIds.length) {
      throw new ApiExecuteSQLError('Failed to insert survey types data', [
        'SurveyRepository->insertSurveyTypes',
        `rowCount was ${response.rowCount}, expected rowCount = ${typeIds.length}`
      ]);
    }
  }

  /**
   * Inserts a new focal species record and returns the new ID
   *
   * @param {number} focal_species_id
   * @param {number} surveyId
   * @returns {*} Promise<number>
   * @memberof SurveyRepository
   */
  async insertFocalSpecies(focal_species_id: number, surveyId: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO study_species (
        itis_tsn,
        is_focal,
        survey_id
      ) VALUES (
        ${focal_species_id},
        TRUE,
        ${surveyId}
      ) RETURNING study_species_id as id;
    `;

    const response = await this.connection.sql(sqlStatement);
    const result = response.rows?.[0];

    if (!result?.id) {
      throw new ApiExecuteSQLError('Failed to insert focal species data', [
        'SurveyRepository->insertSurveyData',
        'response was null or undefined, expected response != null'
      ]);
    }

    return result.id;
  }

  /**
   * Inserts a new Ancillary species record and returns the new ID
   *
   * @param {number} ancillary_species_id
   * @param {number} surveyId
   * @returns {*} Promise<number>
   * @memberof SurveyRepository
   */
  async insertAncillarySpecies(ancillary_species_id: number, surveyId: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO study_species (
        itis_tsn,
        is_focal,
        survey_id
      ) VALUES (
        ${ancillary_species_id},
        FALSE,
        ${surveyId}
      ) RETURNING study_species_id as id;
    `;

    const response = await this.connection.sql(sqlStatement);
    const result = response.rows?.[0];

    if (!result?.id) {
      throw new ApiExecuteSQLError('Failed to insert ancillary species data', [
        'SurveyRepository->insertSurveyData',
        'response was null or undefined, expected response != null'
      ]);
    }

    return result.id;
  }

  /**
   * Inserts a new vantage code record and returns the new ID
   *
   * @param {number} vantage_code_id
   * @param {number} surveyId
   * @returns {*} Promise<number>
   * @memberof SurveyRepository
   */
  async insertVantageCodes(vantage_code_id: number, surveyId: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO survey_vantage (
        vantage_id,
        survey_id
      ) VALUES (
        ${vantage_code_id},
        ${surveyId}
      ) RETURNING survey_vantage_id as id;
    `;

    const response = await this.connection.sql(sqlStatement);
    const result = response.rows?.[0];

    if (!result?.id) {
      throw new ApiExecuteSQLError('Failed to insert vantage codes', [
        'SurveyRepository->insertVantageCodes',
        'response was null or undefined, expected response != null'
      ]);
    }
    return result.id;
  }

  /**
   * Insert many rows associating a survey id to various intended outcome ids.
   *
   * @param {number} surveyId
   * @param {number[]} intendedOutcomeIds
   */
  async insertManySurveyIntendedOutcomes(surveyId: number, intendedOutcomeIds: number[]) {
    const queryBuilder = getKnex().queryBuilder();
    if (intendedOutcomeIds.length) {
      queryBuilder
        .insert(intendedOutcomeIds.map((outcomeId) => ({ survey_id: surveyId, intended_outcome_id: outcomeId })))
        .into('survey_intended_outcome');
      await this.connection.knex(queryBuilder);
    }
  }

  /**
   * Delete many rows associating a survey id to various intended outcome ids.
   *
   * @param {number} surveyId
   * @param {number[]} intendedOutcomeIds
   */
  async deleteManySurveyIntendedOutcomes(surveyId: number, intendedOutcomeIds: number[]) {
    const queryBuilder = getKnex().queryBuilder();
    if (intendedOutcomeIds.length) {
      queryBuilder
        .delete()
        .from('survey_intended_outcome')
        .whereIn('intended_outcome_id', intendedOutcomeIds)
        .andWhere('survey_id', surveyId);
      await this.connection.knex(queryBuilder);
    }
  }

  /**
   * Inserts a new Survey Proprietor record and returns the new ID
   *
   * @param {number} ancillary_species_id
   * @param {number} surveyId
   * @returns {*} Promise<number>
   * @memberof SurveyRepository
   */
  async insertSurveyProprietor(survey_proprietor: PostProprietorData, surveyId: number): Promise<number | undefined> {
    if (!survey_proprietor.survey_data_proprietary) {
      return;
    }

    const sqlStatement = SQL`
      INSERT INTO survey_proprietor (
        survey_id,
        proprietor_type_id,
        first_nations_id,
        rationale,
        proprietor_name,
        disa_required
      ) VALUES (
        ${surveyId},
        ${survey_proprietor.prt_id},
        ${survey_proprietor.fn_id},
        ${survey_proprietor.rationale},
        ${survey_proprietor.proprietor_name},
        ${survey_proprietor.disa_required}
      )
      RETURNING
        survey_proprietor_id as id;
    `;

    const response = await this.connection.sql(sqlStatement);
    const result = response.rows?.[0];

    if (!result?.id) {
      throw new ApiExecuteSQLError('Failed to insert survey proprietor data', [
        'SurveyRepository->insertSurveyProprietor',
        'response was null or undefined, expected response != null'
      ]);
    }

    return result.id;
  }

  /**
   * Associated Survey to a particular permit
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} permitNumber
   * @returns {*} Promise<void>
   * @memberof SurveyRepository
   */
  async associateSurveyToPermit(projectId: number, surveyId: number, permitNumber: string): Promise<void> {
    const sqlStatement = SQL`
      UPDATE
        permit
      SET
        survey_id = ${surveyId}
      WHERE
        project_id = ${projectId}
      AND
        number = ${permitNumber};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update survey permit record', [
        'SurveyRepository->associateSurveyToPermit',
        'response was null or undefined, expected response != null'
      ]);
    }
  }

  /**
   * Inserts or updates survey permit
   *
   * @param {number} systemUserId
   * @param {number} projectId
   * @param {number} surveyId
   * @param {string} permitNumber
   * @param {string} permitType
   * @returns {*} Promise<void>
   * @memberof SurveyRepository
   */
  async insertSurveyPermit(
    systemUserId: number,
    projectId: number,
    surveyId: number,
    permitNumber: string,
    permitType: string
  ): Promise<void> {
    const sqlStatement = SQL`
    INSERT INTO permit (
      system_user_id,
      project_id,
      survey_id,
      number,
      type
    ) VALUES (
      ${systemUserId},
      ${projectId},
      ${surveyId},
      ${permitNumber},
      ${permitType}
    )
    ON CONFLICT (number) DO
    UPDATE SET
      survey_id = ${surveyId}
    WHERE
      permit.project_id = ${projectId}
    AND
      permit.survey_id is NULL;
  `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert survey permit record', [
        'SurveyRepository->insertSurveyPermit',
        'response was null or undefined, expected response != null'
      ]);
    }
  }

  /**
   * Updates Survey details
   *
   * @param {number} surveyId
   * @param {PutSurveyObject} surveyData
   * @returns {*} Promise<void>
   * @memberof SurveyRepository
   */
  async updateSurveyDetailsData(surveyId: number, surveyData: PutSurveyObject) {
    const knex = getKnex();

    let fieldsToUpdate = {};

    if (surveyData.survey_details) {
      fieldsToUpdate = {
        ...fieldsToUpdate,
        name: surveyData.survey_details.name,
        start_date: surveyData.survey_details.start_date,
        end_date: surveyData.survey_details.end_date,
        progress_id: surveyData.survey_details.progress_id
      };
    }

    if (surveyData.purpose_and_methodology) {
      fieldsToUpdate = {
        ...fieldsToUpdate,
        additional_details: surveyData.purpose_and_methodology.additional_details
      };
    }

    const updateSurveyQueryBuilder = knex('survey')
      .update(fieldsToUpdate)
      .where('survey_id', surveyId)
      .andWhere('revision_count', surveyData.survey_details.revision_count);

    const result = await this.connection.knex(updateSurveyQueryBuilder);

    if (!result?.rowCount) {
      throw new ApiExecuteSQLError('Failed to update survey data', [
        'SurveyRepository->updateSurveyDetailsData',
        'response was null or undefined, expected response != null'
      ]);
    }
  }

  /**
   * Deletes Survey type data for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} Promise<void>
   * @memberof SurveyRepository
   */
  async deleteSurveyTypesData(surveyId: number) {
    const sqlStatement = SQL`
      DELETE
        from survey_type
      WHERE
        survey_id = ${surveyId};
    `;

    await this.connection.sql(sqlStatement);
  }

  /**
   * Deletes Survey species data for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} Promise<void>
   * @memberof SurveyRepository
   */
  async deleteSurveySpeciesData(surveyId: number) {
    const sqlStatement = SQL`
      DELETE
        from study_species
      WHERE
        survey_id = ${surveyId};
    `;

    await this.connection.sql(sqlStatement);
  }

  /**
   * Breaks permit survey link for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} Promise<void>
   * @memberof SurveyRepository
   */
  async unassociatePermitFromSurvey(surveyId: number) {
    const sqlStatement = SQL`
      UPDATE
        permit
      SET
        survey_id = ${null}
      WHERE
        survey_id = ${surveyId};
    `;

    await this.connection.sql(sqlStatement);
  }

  /**
   * Deletes Survey proprietor data for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} Promise<void>
   * @memberof SurveyRepository
   */
  async deleteSurveyProprietorData(surveyId: number) {
    const sqlStatement = SQL`
      DELETE
        from survey_proprietor
      WHERE
        survey_id = ${surveyId};
    `;

    await this.connection.sql(sqlStatement);
  }

  /**
   * Deletes Survey vantage codes for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} Promise<void>
   * @memberof SurveyRepository
   */
  async deleteSurveyVantageCodes(surveyId: number) {
    const sqlStatement = SQL`
      DELETE
        from survey_vantage
      WHERE
        survey_id = ${surveyId};
    `;

    await this.connection.sql(sqlStatement);
  }

  /**
   * Gets all indigenous partnerships belonging to the given survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<GetPartnershipsData['indigenous_partnerships'][]>}
   * @memberof SurveyRepository
   */
  async getIndigenousPartnershipsBySurveyId(surveyId: number): Promise<IndigenousPartnershipRecord[]> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        survey_first_nation_partnership sfnp
      WHERE
        sfnp.survey_id = ${surveyId}
    `;

    const response = await this.connection.sql<IndigenousPartnershipRecord>(sqlStatement);

    const result = response.rows;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get survey Indigenous Partnerships data', [
        'SurveyRepository->getIndigenousPartnershipsBySurveyId',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  /**
   * Gets all stakeholder partnerships belonging to the given survey
   * @param {number} surveyId
   * @return {*}  {Promise<GetPartnershipsData['stakeholder_partnerships'][]>}
   * @memberof SurveyRepository
   */
  async getStakeholderPartnershipsBySurveyId(surveyId: number): Promise<StakeholderPartnershipRecord[]> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        survey_stakeholder_partnership
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql<StakeholderPartnershipRecord>(sqlStatement);

    const result = response.rows;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get survey Stakeholder Partnerships data', [
        'SurveyRepository->getStakeholderPartnershipsBySurveyId',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  /**
   * Inserts indegenous partnership records for the given survey
   *
   * @param {number[]} firstNationsIds
   * @param {number} surveyId
   * @return {*}  {Promise<IndigenousPartnershipRecord[]>}
   * @memberof SurveyRepository
   */
  async insertIndigenousPartnerships(
    firstNationsIds: number[],
    surveyId: number
  ): Promise<IndigenousPartnershipRecord[]> {
    const queryBuilder = getKnex()
      .table('survey_first_nation_partnership')
      .insert(
        firstNationsIds.map((firstNationsId: number) => ({
          first_nations_id: firstNationsId,
          survey_id: surveyId
        }))
      )
      .returning('*');

    const response = await this.connection.knex<IndigenousPartnershipRecord>(queryBuilder);

    if (response.rowCount === 0) {
      throw new ApiExecuteSQLError('Failed to insert survey indigenous partnerships', [
        'ErrorRepository->insertIndigenousPartnerships',
        'rowCount was null or undefined, expected rowCount != 0'
      ]);
    }

    return response.rows;
  }

  /**
   * Inserts stakeholder partnership records for the given survey
   *
   * @param {string[]} stakeholderPartners
   * @param {number} surveyId
   * @return {*}  {Promise<StakeholderPartnershipRecord[]>}
   * @memberof SurveyRepository
   */
  async insertStakeholderPartnerships(
    stakeholderPartners: string[],
    surveyId: number
  ): Promise<StakeholderPartnershipRecord[]> {
    const queryBuilder = getKnex()
      .table('survey_stakeholder_partnership')
      .insert(
        stakeholderPartners.map((stakeholder: string) => ({
          name: stakeholder,
          survey_id: surveyId
        }))
      )
      .returning('*');

    const response = await this.connection.knex<StakeholderPartnershipRecord>(queryBuilder);

    if (response.rowCount === 0) {
      throw new ApiExecuteSQLError('Failed to insert survey stakeholder partnerships', [
        'ErrorRepository->insertStakeholderPartnerships',
        'rowCount was null or undefined, expected rowCount != 0'
      ]);
    }

    return response.rows;
  }

  /**
   * Deletes all indgenous partnership records for the given survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>} The number of rows affected
   * @memberof SurveyRepository
   */
  async deleteIndigenousPartnershipsData(surveyId: number): Promise<number> {
    const queryBuilder = getKnex().table('survey_first_nation_partnership').delete().where('survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder);

    return response.rowCount ?? 0;
  }

  /**
   * Deletes all stakeholder partnership records for the given survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>} The number of rows affected
   * @memberof SurveyRepository
   */
  async deleteStakeholderPartnershipsData(surveyId: number): Promise<number> {
    const queryBuilder = getKnex().table('survey_stakeholder_partnership').delete().where('survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder);

    return response.rowCount ?? 0;
  }
}
