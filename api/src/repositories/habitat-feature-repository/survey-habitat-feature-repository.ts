import SQL from 'sql-template-strings';
import { getKnex } from '../../database/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { BaseRepository } from '../base-repository';
import {
  FindSurveyHabitatFeatureAdvancedFilters,
  InsertSurveyHabitatFeature,
  SurveyHabitatFeatureCount,
  SurveyHabitatFeatureWithTaxons
} from './survey-habitat-feature-repository.interface';
import { makeFindSurveyHabitatFeaturesQuery } from './utils';

/**
 * Repository class for working with survey habitat feature records.
 *
 * @export
 * @class SurveyHabitatFeatureRepository
 * @extends {BaseRepository}
 */
export class SurveyHabitatFeatureRepository extends BaseRepository {
  /**
   * Insert survey habitat feature records for the provided survey id.
   *
   * @param {number} surveyId The ID of the survey under which the habitat features are being inserted.
   * @param {InsertSurveyHabitatFeature[]} habitatFeatures The habitat features to insert.
   * @memberof SurveyHabitatFeatureRepository
   */
  async insertSurveyHabitatFeatures(surveyId: number, habitatFeatures: InsertSurveyHabitatFeature[]) {
    const knex = getKnex();

    const query = knex.queryBuilder();

    query
      .insert(
        habitatFeatures.map((habitatFeature) => ({
          survey_id: surveyId,
          ...habitatFeature
        }))
      )
      .into('survey_habitat_feature');

    const response = await this.connection.knex(query);

    if (response.rowCount !== habitatFeatures.length) {
      throw new ApiExecuteSQLError('Failed to insert survey habitat feature records', [
        'SurveyHabitatFeatureRepository->insertSurveyHabitatFeatures',
        `rowCount was ${response.rowCount}, expected rowCount = ${habitatFeatures.length}`
      ]);
    }
  }

  /**
   * Update an existing survey habitat feature record, for a survey.
   *
   * @param {number} surveyId
   * @param {number} surveyHabitatFeatureId
   * @param {InsertSurveyHabitatFeature} habitatFeature
   * @return {*}  {Promise<void>}
   * @memberof SurveyHabitatFeatureRepository
   */
  async updateSurveyHabitatFeature(
    surveyId: number,
    surveyHabitatFeatureId: number,
    habitatFeature: InsertSurveyHabitatFeature
  ): Promise<void> {
    const knex = getKnex();

    const query = knex.queryBuilder();

    query
      .update({
        ...habitatFeature
      })
      .from('survey_habitat_feature')
      .where('survey_habitat_feature_id', surveyHabitatFeatureId)
      .andWhere('survey_id', surveyId);

    const response = await this.connection.knex(query);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to update survey habitat feature', [
        'SurveyHabitatFeatureRepository->updateSurveyHabitatFeature',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }
  }

  /**
   * Get a single survey habitat feature record.
   *
   * @param {number} surveyId
   * @param {number} surveyHabitatFeatureId
   * @return {*}  {Promise<SurveyHabitatFeatureWithTaxons>}
   * @memberof SurveyHabitatFeatureRepository
   */
  async getSurveyHabitatFeature(
    surveyId: number,
    surveyHabitatFeatureId: number
  ): Promise<SurveyHabitatFeatureWithTaxons> {
    const knex = getKnex();

    const query = knex.queryBuilder();

    query
      .select([
        'survey_habitat_feature_id',
        'survey_id',
        'habitat_feature_type_id',
        'count',
        'latitude',
        'longitude',
        'observed_date',
        'observed_time',
        knex.raw(`
          COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'survey_habitat_feature_taxon_id', survey_habitat_feature_taxon.survey_habitat_feature_taxon_id,
                  'survey_habitat_feature_id', survey_habitat_feature_taxon.survey_habitat_feature_id,
                  'itis_tsn', survey_habitat_feature_taxon.itis_tsn,
                  'itis_scientific_name', survey_habitat_feature_taxon.itis_scientific_name,
                  'comment', survey_habitat_feature_taxon.comment
                )
              )
              FROM survey_habitat_feature_taxon
              WHERE survey_habitat_feature_taxon.survey_habitat_feature_id = survey_habitat_feature.survey_habitat_feature_id
            ),
            '[]'::jsonb
          ) AS survey_habitat_feature_taxons
        `)
      ])
      .from('survey_habitat_feature')
      .where('survey_habitat_feature.survey_habitat_feature_id', surveyHabitatFeatureId)
      .andWhere('survey_id', surveyId);

    const response = await this.connection.knex(query, SurveyHabitatFeatureWithTaxons);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get survey habitat feature', [
        'SurveyHabitatFeatureRepository->getSurveyHabitatFeature',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Get paginated habitat features for a survey.
   *
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveyHabitatFeatureWithTaxons[]>}
   * @memberof SurveyHabitatFeatureRepository
   */
  async getSurveyHabitatFeatures(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyHabitatFeatureWithTaxons[]> {
    const knex = getKnex();

    const query = knex.queryBuilder();

    query
      .select([
        'survey_habitat_feature_id',
        'survey_id',
        'habitat_feature_type_id',
        'count',
        'latitude',
        'longitude',
        'observed_date',
        'observed_time',
        knex.raw(`
          COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'survey_habitat_feature_taxon_id', survey_habitat_feature_taxon.survey_habitat_feature_taxon_id,
                  'survey_habitat_feature_id', survey_habitat_feature_taxon.survey_habitat_feature_id,
                  'itis_tsn', survey_habitat_feature_taxon.itis_tsn,
                  'itis_scientific_name', survey_habitat_feature_taxon.itis_scientific_name,
                  'comment', survey_habitat_feature_taxon.comment
                )
              )
              FROM survey_habitat_feature_taxon
              WHERE survey_habitat_feature_taxon.survey_habitat_feature_id = survey_habitat_feature.survey_habitat_feature_id
            ),
            '[]'::jsonb
          ) AS survey_habitat_feature_taxons
        `)
      ])
      .from('survey_habitat_feature')
      .where('survey_id', surveyId);

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, SurveyHabitatFeatureWithTaxons);

    return response.rows;
  }

  /**
   * Get the total count of habitat features for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof SurveyHabitatFeatureRepository
   */
  async getSurveyHabitatFeaturesCount(surveyId: number): Promise<number> {
    const sqlStatement = SQL`
      SELECT
        count(*)::integer as count
      FROM
        survey_habitat_feature
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, SurveyHabitatFeatureCount);

    return response.rows[0].count;
  }

  /**
   * Get survey habitat feature records for the current user, based on their permissions and filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {number} systemUserId
   * @param {FindSurveyHabitatFeatureAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveyHabitatFeatureWithTaxons[]>}
   * @memberof SurveyHabitatFeatureRepository
   */
  async findSurveyHabitatFeatures(
    isUserAdmin: boolean,
    systemUserId: number,
    filterFields: FindSurveyHabitatFeatureAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyHabitatFeatureWithTaxons[]> {
    const query = makeFindSurveyHabitatFeaturesQuery(isUserAdmin, systemUserId, filterFields);

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, SurveyHabitatFeatureWithTaxons);

    return response.rows;
  }

  /**
   * Get the total count of survey habitat feature records for the current user, based on their permissions and filter
   * criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {number} systemUserId
   * @param {FindSurveyHabitatFeatureAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof SurveyHabitatFeatureRepository
   */
  async findSurveyHabitatFeaturesCount(
    isUserAdmin: boolean,
    systemUserId: number,
    filterFields: FindSurveyHabitatFeatureAdvancedFilters
  ): Promise<number> {
    const findSurveyHabitatFeaturesQuery = makeFindSurveyHabitatFeaturesQuery(isUserAdmin, systemUserId, filterFields);

    const knex = getKnex();

    const queryBuilder = knex
      .from(findSurveyHabitatFeaturesQuery.as('fshfq'))
      .select(knex.raw('count(*)::integer as count'));

    const response = await this.connection.knex(queryBuilder, SurveyHabitatFeatureCount);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get survey habitat features count', [
        'SurveyHabitatFeatureRepository->findSurveyHabitatFeaturesCount',
        'rowCount was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Delete existing survey habitat feature records, for a survey, and all dependent records.
   *
   * @param {number} surveyId
   * @param {number[]} surveyHabitatFeatureIds
   * @return {*}  {Promise<void>}
   * @memberof SurveyHabitatFeatureRepository
   */
  async deleteSurveyHabitatFeatures(surveyId: number, surveyHabitatFeatureIds: number[]): Promise<void> {
    const knex = getKnex();

    const query = knex.queryBuilder();

    query
      .with('w_delete_survey_habitat_feature_taxon', (qb) => {
        qb.delete()
          .from('survey_habitat_feature_taxon')
          .whereIn('survey_habitat_feature_id', surveyHabitatFeatureIds)
          .andWhere('survey_id', surveyId);
      })
      .with('w_delete_survey_habitat_feature_quantitative_value', (qb) => {
        qb.delete()
          .from('survey_habitat_feature_quantitative_value')
          .whereIn('survey_habitat_feature_id', surveyHabitatFeatureIds)
          .andWhere('survey_id', surveyId);
      })
      .with('w_delete_survey_habitat_feature_qualitative_value', (qb) => {
        qb.delete()
          .from('survey_habitat_feature_qualitative_value')
          .whereIn('survey_habitat_feature_id', surveyHabitatFeatureIds)
          .andWhere('survey_id', surveyId);
      })
      .delete()
      .from('survey_habitat_feature')
      .whereIn('survey_habitat_feature_id', surveyHabitatFeatureIds)
      .andWhere('survey_id', surveyId);

    const response = await this.connection.knex(query);

    if (response.rowCount !== surveyHabitatFeatureIds.length) {
      throw new ApiExecuteSQLError('Failed to delete survey habitat features', [
        'SurveyHabitatFeatureRepository->deleteSurveyHabitatFeatures',
        `rowCount was ${response.rowCount}, expected rowCount = ${surveyHabitatFeatureIds.length}`
      ]);
    }
  }
}
