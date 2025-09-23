import { Feature } from 'geojson';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ISiteAdvancedFilters } from '../../models/site-view';
import { SurveyBlockRecord } from './../../database-models/survey_block';
import { SurveySampleBlockRecord } from './../../database-models/survey_sample_block';
import { SurveySampleSiteModel, SurveySampleSiteRecord } from './../../database-models/survey_sample_site';
import { SurveySampleStratumRecord } from './../../database-models/survey_sample_stratum';
import { SurveyStratumRecord } from './../../database-models/survey_stratum';
import { getKnex } from './../../database/db';
import { ApiExecuteSQLError } from './../../errors/api-error';
import { generateGeometryCollectionSQL } from './../../utils/spatial-utils';
import { ApiPaginationOptions } from './../../zod-schema/pagination';
import { BaseRepository } from './../base-repository';
import { SampleBlockRecord } from './../sample-blocks-repository';
import { SampleStratumRecord } from './../sample-stratums-repository';
import { getSampleSiteBaseQuery, makeFindSamplingSiteBaseQuery } from './utils';

/**
 * A sample site without spatial data. Includes any associated survey blocks and survey stratums.
 */
export const SampleSiteRecordExtendedNonSpatial = z.object({
  survey_sample_site_id: z.number(),
  survey_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  geometry_type: z.string(),
  blocks: z.array(
    SampleBlockRecord.pick({
      survey_sample_block_id: true,
      survey_block_id: true,
      survey_sample_site_id: true
    }).extend({
      name: z.string(),
      description: z.string()
    })
  ),
  stratums: z.array(
    SampleStratumRecord.pick({
      survey_sample_stratum_id: true,
      survey_stratum_id: true,
      survey_sample_site_id: true
    }).extend({
      name: z.string(),
      description: z.string()
    })
  )
});
export type SampleSiteRecordExtendedNonSpatial = z.infer<typeof SampleSiteRecordExtendedNonSpatial>;

/**
 * An aggregate record that includes a single sample site, and its associated survey blocks and survey stratums.
 */
export const SampleSiteRecordExtended = SampleSiteRecordExtendedNonSpatial.omit({ geometry_type: true }).extend({
  geojson: z.any()
});
export type SampleSiteRecordExtended = z.infer<typeof SampleSiteRecordExtended>;

/**
 * A survey_sample_site geometry
 */
export const SampleSiteGeometryRecord = z.object({
  survey_sample_site_id: z.number(),
  geojson: z.any()
});
export type SampleSiteGeometryRecord = z.infer<typeof SampleSiteGeometryRecord>;

/**
 * Insert object for a single sample site record.
 */
export type InsertSampleSiteRecord = Pick<SurveySampleSiteRecord, 'name' | 'description' | 'geojson'>;

/**
 * Update object for a single sample site record.
 */
export type UpdateSampleSiteRecord = Pick<
  SurveySampleSiteRecord,
  'survey_sample_site_id' | 'name' | 'description' | 'geojson'
>;

export const FindSampleSiteRecord = SurveySampleSiteRecord.pick({
  survey_sample_site_id: true,
  survey_id: true,
  name: true,
  description: true
}).extend({
  geometry_type: z.string(),
  blocks: z.array(
    SurveySampleBlockRecord.pick({
      survey_sample_block_id: true,
      survey_sample_site_id: true,
      survey_block_id: true
    }).merge(
      SurveyBlockRecord.pick({
        name: true,
        description: true
      })
    )
  ),
  stratums: z.array(
    SurveySampleStratumRecord.pick({
      survey_sample_stratum_id: true,
      survey_sample_site_id: true,
      survey_stratum_id: true
    }).merge(
      SurveyStratumRecord.pick({
        name: true,
        description: true
      })
    )
  )
});

export type FindSampleSiteRecord = z.infer<typeof FindSampleSiteRecord>;

/**
 * Sample Site Repository
 *
 * @export
 * @class SampleSiteRepository
 * @extends {BaseRepository}
 */
export class SampleSiteRepository extends BaseRepository {
  /**
   * Gets a paginated set of Sample sites for the given survey for a given Survey
   *
   * @param {number[]} surveyIds
   * @param {{
   *       keyword?: string;
   *       sampleSiteIds?: number[];
   *       pagination?: ApiPaginationOptions;
   *     }} [options]
   * @return {*}  {Promise<SampleSiteRecordExtendedNonSpatial[]>}
   * @memberof SampleSiteRepository
   */
  async getSampleSitesForSurveyIds(
    surveyIds: number[],
    options?: {
      keyword?: string;
      sampleSiteIds?: number[];
      pagination?: ApiPaginationOptions;
    }
  ): Promise<SampleSiteRecordExtendedNonSpatial[]> {
    const { keyword, sampleSiteIds, pagination } = options || {};

    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .with('w_survey_sample_block', (qb) => {
        // Aggregate sample blocks into an array of objects
        qb.select(
          'ssb.survey_sample_site_id',
          knex.raw(`
          json_agg(json_build_object(
            'survey_sample_block_id', ssb.survey_sample_block_id,
            'survey_sample_site_id', ssb.survey_sample_site_id,
            'survey_block_id', ssb.survey_block_id,
            'name', sb.name,
            'description', sb.description
          )) as blocks`)
        )
          .from({ ssb: 'survey_sample_block' })
          .leftJoin('survey_block as sb', 'sb.survey_block_id', 'ssb.survey_block_id')
          .groupBy('ssb.survey_sample_site_id');
      })
      .with('w_survey_sample_stratum', (qb) => {
        // Aggregate sample stratums into an array of objects
        qb.select(
          'ssst.survey_sample_site_id',
          knex.raw(`
          json_agg(json_build_object(
            'survey_sample_stratum_id', ssst.survey_sample_stratum_id,
            'survey_sample_site_id', ssst.survey_sample_site_id,
            'survey_stratum_id', ssst.survey_stratum_id,
            'name', ss.name,
            'description', ss.description
          )) as stratums`)
        )
          .from({ ssst: 'survey_sample_stratum' })
          .leftJoin('survey_stratum as ss', 'ss.survey_stratum_id', 'ssst.survey_stratum_id')
          .groupBy('ssst.survey_sample_site_id');
      })
      // Fetch sample sites and include the corresponding sample methods, blocks, and stratums
      .select(
        'sss.survey_sample_site_id',
        'sss.survey_id',
        'sss.name',
        'sss.description',
        knex.raw(`sss.geojson->'geometry'->>'type' as geometry_type`),
        knex.raw(`
          COALESCE(wssb.blocks, '[]'::json) as blocks,
          COALESCE(wsss.stratums, '[]'::json) as stratums
        `)
      )
      .from({ sss: 'survey_sample_site' })
      .leftJoin('w_survey_sample_block as wssb', 'wssb.survey_sample_site_id', 'sss.survey_sample_site_id')
      .leftJoin('w_survey_sample_stratum as wsss', 'wsss.survey_sample_site_id', 'sss.survey_sample_site_id')
      .whereIn('sss.survey_id', surveyIds);

    if (sampleSiteIds) {
      // Filter results by sample site IDs
      queryBuilder.whereIn('sss.survey_sample_site_id', sampleSiteIds);
    }

    if (keyword) {
      // Filter results by keyword
      queryBuilder.andWhere((qb) => {
        qb.orWhere('sss.name', 'ilike', `%${keyword}%`).orWhere('sss.description', 'ilike', `%${keyword}%`);
      });
    } else if (pagination) {
      // Filter results by pagination
      queryBuilder.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        queryBuilder.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(queryBuilder, SampleSiteRecordExtendedNonSpatial);

    return response.rows;
  }

  /**
   * Returns the total count of sample sites belonging to the given survey.
   *
   * @param {number[]} surveyIds
   * @return {*}  {Promise<number>}
   * @memberof SampleSiteRepository
   */
  async getSampleSitesCountBySurveyIds(surveyIds: number[]): Promise<number> {
    const sqlStatement = SQL`
      SELECT
        COUNT(*)::integer AS count
      FROM
        survey_sample_site
      WHERE 
        survey_id = ANY (${surveyIds});
    `;

    const response = await this.connection.sql(sqlStatement, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get sample site count', [
        'SampleSiteRepository->getSampleSitesCountBySurveyId',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Gets a sample site by sample site ID, including methods and periods
   *
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleSiteRecordExtended>}
   * @memberof SampleSiteService
   */
  async getSurveySampleSiteBySiteId(surveyId: number, surveySampleSiteId: number): Promise<SampleSiteRecordExtended> {
    const knex = getKnex();
    const queryBuilder = getSampleSiteBaseQuery(knex)
      .where('sss.survey_id', surveyId)
      .where('sss.survey_sample_site_id', surveySampleSiteId);

    const response = await this.connection.knex(queryBuilder, SampleSiteRecordExtended);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get sample site by ID', [
        'SampleSiteRepository->getSurveySampleSiteBySiteId',
        'rowCount was < 1, expected rowCount > 0'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Gets geometry for sampling sites in the survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SampleSiteGeometryRecord[]>}
   * @memberof SampleSiteRepository
   */
  async getSampleSitesGeometryBySurveyId(surveyId: number): Promise<SampleSiteGeometryRecord[]> {
    const sqlStatement = SQL`
      SELECT 
        survey_sample_site_id,
        geojson
      FROM 
        survey_sample_site
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, SampleSiteGeometryRecord);

    return response.rows;
  }

  /**
   * Retrieve the list of sites that the user has access to, based on filters and pagination options.
   *
   * @param {boolean} isUserAdmin Whether the user is an admin.
   * @param {number | null} systemUserId The user's ID.
   * @param {ISiteAdvancedFilters} filterFields The filter fields to apply.
   * @param {ApiPaginationOptions} [pagination] The pagination options.
   * @return {*}  {Promise<FindSampleSiteRecord[]>}
   * @memberof SampleSiteRepository
   */
  async findSites(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields?: ISiteAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindSampleSiteRecord[]> {
    const query = makeFindSamplingSiteBaseQuery(isUserAdmin, systemUserId, filterFields);

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, FindSampleSiteRecord);

    return response.rows;
  }

  /**
   * Retrieve the count of sites that the user has access to, based on filters and pagination options.
   *
   * @param {boolean} isUserAdmin Whether the user is an admin.
   * @param {number | null} systemUserId The user's ID.
   * @param {ISiteAdvancedFilters} filterFields The filter fields to apply.
   * @return {*}  {Promise<number>}
   * @memberof SampleSiteRepository
   */
  async findSitesCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ISiteAdvancedFilters
  ): Promise<number> {
    const knex = getKnex();

    const findSitesQuery = makeFindSamplingSiteBaseQuery(isUserAdmin, systemUserId, filterFields);

    const query = knex.from(findSitesQuery.as('fsq')).select(knex.raw('count(*)::integer as count'));

    const response = await this.connection.knex(query, z.object({ count: z.number() }));

    return response.rows[0].count;
  }

  /**
   * Updates a survey sample site record.
   *
   * @param {number} surveyId
   * @param {UpdateSampleSiteRecord} sample
   * @return {*}  {Promise<SurveySampleSiteModel>}
   * @memberof SampleSiteRepository
   */
  async updateSampleSite(surveyId: number, sample: UpdateSampleSiteRecord): Promise<SurveySampleSiteModel> {
    const sql = SQL`
      UPDATE
        survey_sample_site
      SET
        survey_id=${surveyId},
        name=${sample.name},
        description=${sample.description},
        geojson=${sample.geojson},
        geography=public.geography(
          public.ST_Force2D(
            public.ST_SetSRID(
      `;
    const geometryCollectionSQL = generateGeometryCollectionSQL(sample.geojson as Feature[]);
    sql.append(geometryCollectionSQL);
    sql.append(SQL`, 4326)))`);
    sql.append(SQL`
      WHERE
        survey_sample_site_id = ${sample.survey_sample_site_id}
      RETURNING
        *;`);

    const response = await this.connection.sql(sql, SurveySampleSiteModel);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update sample site record', [
        'SampleSiteRepository->updateSampleSite',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a new survey sample site record.
   *
   * Business requirement to default all names to Sample Site #.
   * The # is based on the current number of sample sites associated to a survey.
   *
   * @param {number} surveyId
   * @param {InsertSampleSiteRecord} sampleSite
   * @return {*}  {Promise<SurveySampleSiteModel>}
   * @memberof SampleSiteRepository
   */
  async insertSampleSite(surveyId: number, sampleSite: InsertSampleSiteRecord): Promise<SurveySampleSiteModel> {
    const sqlStatement = SQL`
    INSERT INTO survey_sample_site (
      survey_id,
      name,
      description,
      geojson,
      geography
    ) VALUES (
      ${surveyId},
      ${sampleSite.name},
      ${sampleSite.description},
      ${sampleSite.geojson},
        `;
    const geometryCollectionSQL = generateGeometryCollectionSQL(sampleSite.geojson);

    sqlStatement.append(SQL`
      public.geography(
        public.ST_Force2D(
          public.ST_SetSRID(
    `);

    sqlStatement.append(geometryCollectionSQL);

    sqlStatement.append(SQL`
      , 4326)))
    `);

    sqlStatement.append(SQL`
      )
      RETURNING
        *;
    `);

    const response = await this.connection.sql(sqlStatement, SurveySampleSiteModel);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert sample site', [
        'SampleSiteRepository->insertSampleSite',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Deletes a survey sample site record.
   *
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SurveySampleSiteModel>}
   * @memberof SampleSiteRepository
   */
  async deleteSampleSiteRecord(surveyId: number, surveySampleSiteId: number): Promise<SurveySampleSiteModel> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_sample_site
      WHERE
        survey_sample_site_id = ${surveySampleSiteId}
      AND
        survey_id = ${surveyId}
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement, SurveySampleSiteModel);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete survey sample site record', [
        'SampleSiteRepository->deleteSampleSiteRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }
}
