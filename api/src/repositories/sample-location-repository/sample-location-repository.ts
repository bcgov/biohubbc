import { Feature } from 'geojson';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../../database/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { generateGeometryCollectionSQL } from '../../utils/spatial-utils';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { BaseRepository } from '../base-repository';
import { SampleBlockRecord, UpdateSampleBlockRecord } from '../sample-blocks-repository';
import { SampleMethodRecord, UpdateSampleMethodRecord } from '../sample-method-repository';
import { SamplePeriodRecord } from '../sample-period-repository';
import { SampleStratumRecord, UpdateSampleStratumRecord } from '../sample-stratums-repository';
import { getSamplingLocationBaseQuery } from './utils';

/**
 * An aggregate record of a sample site without spatial data, including all of the child sample methods,
 * and for each child sample method, all of its child sample periods. Also includes any survey blocks or survey
 * stratums that this site belongs to.
 */
export const SampleLocationNonSpatialRecord = z.object({
  survey_sample_site_id: z.number(),
  survey_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  geometry_type: z.string(),
  sample_methods: z.array(
    SampleMethodRecord.pick({
      survey_sample_method_id: true,
      survey_sample_site_id: true,
      description: true,
      method_response_metric_id: true
    }).extend(
      z.object({
        technique: z.object({
          method_technique_id: z.number(),
          name: z.string(),
          description: z.string().nullable(),
          attractants: z.array(
            z.object({
              attractant_lookup_id: z.number()
            })
          )
        }),
        sample_periods: z.array(
          SamplePeriodRecord.pick({
            survey_sample_period_id: true,
            survey_sample_method_id: true,
            start_date: true,
            start_time: true,
            end_date: true,
            end_time: true
          })
        )
      }).shape
    )
  ),
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
export type SampleLocationNonSpatialRecord = z.infer<typeof SampleLocationNonSpatialRecord>;

/**
 * Basic sample location data retrieved for supplementary observations data
 */
export const SampleLocationBasicRecord = z.object({
  survey_sample_site_id: z.number(),
  name: z.string(),
  sample_methods: z.array(
    SampleMethodRecord.pick({
      survey_sample_method_id: true,
      survey_sample_site_id: true,
      method_response_metric_id: true
    }).extend(
      z.object({
        technique: z.object({
          method_technique_id: z.number(),
          name: z.string()
        }),
        sample_periods: z.array(
          SamplePeriodRecord.pick({
            survey_sample_period_id: true,
            survey_sample_method_id: true,
            start_date: true,
            start_time: true,
            end_date: true,
            end_time: true
          })
        )
      }).shape
    )
  )
});
export type SampleLocationBasicRecord = z.infer<typeof SampleLocationBasicRecord>;

/**
 * An aggregate record that includes a single sample site, its location, all of its child sample methods, and for each child sample
 * method, all of its child sample periods. Also includes any survey blocks or survey stratums that this site belongs to.
 */
export const SampleLocationRecord = SampleLocationNonSpatialRecord.omit({ geometry_type: true }).extend({
  geojson: z.any()
});
export type SampleLocationRecord = z.infer<typeof SampleLocationRecord>;

/**
 * A survey_sample_site geometry
 */
export const SampleSiteGeometryRecord = z.object({
  survey_sample_site_id: z.number(),
  geojson: z.any()
});
export type SampleSiteGeometryRecord = z.infer<typeof SampleSiteGeometryRecord>;

/**
 * A survey_sample_site record.
 */
export const SampleSiteRecord = SampleSiteGeometryRecord.extend({
  survey_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  geometry: z.null(),
  geography: z.any(),
  geojson: z.any(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type SampleSiteRecord = z.infer<typeof SampleSiteRecord>;

/**
 * Insert object for a single sample site record.
 */
export type InsertSampleSiteRecord = Pick<SampleSiteRecord, 'name' | 'description' | 'geojson'>;

/**
 * Update object for a single sample site record.
 */
export type UpdateSampleSiteRecord = Pick<
  SampleSiteRecord,
  'survey_sample_site_id' | 'survey_id' | 'name' | 'description' | 'geojson'
>;

/**
 * Update object for a sample site record, including all associated methods and periods.
 */
export type UpdateSampleLocationRecord = {
  survey_id: number;
  survey_sample_site_id: number;
  name: string;
  description: string;
  geojson: Feature;
  methods: UpdateSampleMethodRecord[];
  blocks: UpdateSampleBlockRecord[];
  stratums: UpdateSampleStratumRecord[];
};

/**
 * Sample Location Repository
 *
 * @export
 * @class SampleLocationRepository
 * @extends {BaseRepository}
 */
export class SampleLocationRepository extends BaseRepository {
  /**
   * Gets a paginated set of Sample Locations for the given survey for a given Survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SampleLocationNonSpatialRecord[]>}
   * @memberof SampleLocationRepository
   */
  async getSampleLocationsForSurveyId(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<SampleLocationNonSpatialRecord[]> {
    const knex = getKnex();
    const queryBuilder = knex
      .queryBuilder()
      .with('w_method_technique_attractant', (qb) => {
        // Gather technique attractants
        qb.select(
          'mta.method_technique_id',
          knex.raw(`
          json_agg(json_build_object(
            'attractant_lookup_id', mta.attractant_lookup_id
          )) as attractants`)
        )
          .from({ mta: 'method_technique_attractant' })
          .groupBy('mta.method_technique_id');
      })
      .with('w_method_technique', (qb) => {
        // Gather method techniques
        qb.select(
          'mt.method_technique_id',
          knex.raw(`
          json_build_object(
            'method_technique_id', mt.method_technique_id,
            'name', mt.name,
            'description', mt.description,
            'attractants', COALESCE(wmta.attractants, '[]'::json)
          ) as method_technique`)
        )
          .from({ mt: 'method_technique' })
          .leftJoin('w_method_technique_attractant as wmta', 'wmta.method_technique_id', 'mt.method_technique_id');
      })
      .with('w_survey_sample_period', (qb) => {
        // Aggregate sample periods into an array of objects
        qb.select(
          'ssp.survey_sample_method_id',
          knex.raw(`
          json_agg(json_build_object(
            'survey_sample_period_id', ssp.survey_sample_period_id,
            'survey_sample_method_id', ssp.survey_sample_method_id,
            'start_date', ssp.start_date,
            'start_time', ssp.start_time,
            'end_date', ssp.end_date,
            'end_time', ssp.end_time
          ) ORDER BY ssp.start_date, ssp.start_time) as sample_periods`)
        )
          .from({ ssp: 'survey_sample_period' })
          .groupBy('ssp.survey_sample_method_id');
      })
      .with('w_survey_sample_method', (qb) => {
        // Aggregate sample methods into an array of objects and include the corresponding sample periods
        qb.select(
          'ssm.survey_sample_site_id',
          knex.raw(`
          json_agg(json_build_object(
            'survey_sample_method_id', ssm.survey_sample_method_id,
            'survey_sample_site_id', ssm.survey_sample_site_id,
            'description', ssm.description,
            'sample_periods', COALESCE(wssp.sample_periods, '[]'::json),
            'technique', wmt.method_technique,
            'method_response_metric_id', ssm.method_response_metric_id
          )) as sample_methods`)
        )
          .from({ ssm: 'survey_sample_method' })
          .leftJoin('w_survey_sample_period as wssp', 'wssp.survey_sample_method_id', 'ssm.survey_sample_method_id')
          .leftJoin('w_method_technique as wmt', 'wmt.method_technique_id', 'ssm.method_technique_id')
          .groupBy('ssm.survey_sample_site_id');
      })
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
        COALESCE(wssm.sample_methods, '[]'::json) as sample_methods,
        COALESCE(wssb.blocks, '[]'::json) as blocks,
        COALESCE(wssst.stratums, '[]'::json) as stratums`)
      )
      .from({ sss: 'survey_sample_site' })
      .leftJoin('w_survey_sample_method as wssm', 'wssm.survey_sample_site_id', 'sss.survey_sample_site_id')
      .leftJoin('w_survey_sample_block as wssb', 'wssb.survey_sample_site_id', 'sss.survey_sample_site_id')
      .leftJoin('w_survey_sample_stratum as wssst', 'wssst.survey_sample_site_id', 'sss.survey_sample_site_id')
      .where('sss.survey_id', surveyId);

    if (pagination) {
      queryBuilder.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        queryBuilder.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(queryBuilder, SampleLocationNonSpatialRecord);

    return response.rows;
  }

  /**
   * Returns the total count of sample locations belonging to the given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof SampleLocationRepository
   */
  async getSampleLocationsCountBySurveyId(surveyId: number): Promise<number> {
    const sqlStatement = SQL`
      SELECT
        COUNT(*)::integer AS count
      FROM
        survey_sample_site
      WHERE 
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get sample site count', [
        'SampleLocationRepository->getSampleLocationsCountBySurveyId',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Gets a sample site record by sample site ID.
   *
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleSiteRecord>}
   * @memberof SampleLocationService
   */
  async getSurveySampleSiteById(surveyId: number, surveySampleSiteId: number): Promise<SampleSiteRecord> {
    const sqlStatement = SQL`
      SELECT
        sss.*
      FROM
        survey_sample_site as sss
      WHERE
        sss.survey_id = ${surveyId}
      AND
        sss.survey_sample_site_id = ${surveySampleSiteId}
    `;

    const response = await this.connection.sql(sqlStatement, SampleSiteRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get sample site by ID', [
        'SampleLocationRepository->getSurveySampleSiteById',
        'rowCount was < 1, expected rowCount > 0'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Gets a sample location by sample site ID, including methods and periods
   *
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleLocationRecord>}
   * @memberof SampleLocationService
   */
  async getSurveySampleLocationBySiteId(surveyId: number, surveySampleSiteId: number): Promise<SampleLocationRecord> {
    const knex = getKnex();
    const queryBuilder = getSamplingLocationBaseQuery(knex)
      .where('sss.survey_id', surveyId)
      .where('sss.survey_sample_site_id', surveySampleSiteId);

    const response = await this.connection.knex(queryBuilder, SampleLocationRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get sample site by ID', [
        'SampleLocationRepository->getSurveySampleLocationBySiteId',
        'rowCount was < 1, expected rowCount > 0'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Gets basic data for survey sample sites for supplementary observations data
   *
   * @param {number} surveyId
   * @param {number[]} surveySampleSiteIds
   * @return {*}  {Promise<SampleLocationRecord>}
   * @memberof SampleLocationService
   */
  async getBasicSurveySampleLocationsBySiteIds(
    surveyId: number,
    surveySampleSiteIds: number[]
  ): Promise<SampleLocationBasicRecord[]> {
    const knex = getKnex();
    const queryBuilder = knex
      .queryBuilder()
      .with('w_method_technique', (qb) => {
        qb.select('mt.method_technique_id', 'mt.name').from({ mt: 'method_technique' });
      })
      .with('w_survey_sample_period', (qb) => {
        qb.select(
          'ssp.survey_sample_method_id',
          knex.raw(`
          json_agg(json_build_object(
            'survey_sample_period_id', ssp.survey_sample_period_id,
            'survey_sample_method_id', ssp.survey_sample_method_id,
            'start_date', ssp.start_date,
            'end_date', ssp.end_date,
            'start_time', ssp.start_time,
            'end_time', ssp.end_time
          ) ORDER BY ssp.start_date, ssp.start_time) as sample_periods`)
        )
          .from({ ssp: 'survey_sample_period' })
          .groupBy('ssp.survey_sample_method_id');
      })
      .with('w_survey_sample_method', (qb) => {
        qb.select(
          'ssm.survey_sample_site_id',
          knex.raw(`
          json_agg(json_build_object(
            'survey_sample_method_id', ssm.survey_sample_method_id,
            'survey_sample_site_id', ssm.survey_sample_site_id,
            'method_response_metric_id', ssm.method_response_metric_id,
            'technique', json_build_object(
              'method_technique_id', wmt.method_technique_id,
              'name', wmt.name
            ),
            'sample_periods', COALESCE(wssp.sample_periods, '[]'::json)
          )) as sample_methods`)
        )
          .from({ ssm: 'survey_sample_method' })
          .leftJoin('w_survey_sample_period as wssp', 'wssp.survey_sample_method_id', 'ssm.survey_sample_method_id')
          .leftJoin('w_method_technique as wmt', 'wmt.method_technique_id', 'ssm.method_technique_id')
          .groupBy('ssm.survey_sample_site_id');
      })
      .select(
        'sss.survey_sample_site_id',
        'sss.name',
        knex.raw(`
        COALESCE(wssm.sample_methods, '[]'::json) as sample_methods
      `)
      )
      .from({ sss: 'survey_sample_site' })
      .leftJoin('w_survey_sample_method as wssm', 'wssm.survey_sample_site_id', 'sss.survey_sample_site_id')
      .where('sss.survey_id', surveyId)
      .whereIn('sss.survey_sample_site_id', surveySampleSiteIds);

    const response = await this.connection.knex(queryBuilder, SampleLocationBasicRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get sample sites by IDs', [
        'SampleLocationRepository->getBasicSurveySampleLocationsBySiteIds',
        'rowCount was < 1, expected rowCount > 0'
      ]);
    }

    return response.rows;
  }

  /**
   * Gets geometry for sampling sites in the survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SampleSiteGeometryRecord[]>}
   * @memberof SampleLocationRepository
   */
  async getSampleLocationsGeometryBySurveyId(surveyId: number): Promise<SampleSiteGeometryRecord[]> {
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
   * Updates a survey sample site record.
   *
   * @param {UpdateSampleSiteRecord} sample
   * @return {*}  {Promise<SampleSiteRecord>}
   * @memberof SampleLocationRepository
   */
  async updateSampleSite(sample: UpdateSampleSiteRecord): Promise<SampleSiteRecord> {
    const sql = SQL`
      UPDATE
        survey_sample_site
      SET
        survey_id=${sample.survey_id},
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

    const response = await this.connection.sql(sql, SampleSiteRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update sample location record', [
        'SampleLocationRepository->updateSampleSite',
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
   * @return {*}  {Promise<SampleSiteRecord>}
   * @memberof SampleLocationRepository
   */
  async insertSampleSite(surveyId: number, sampleSite: InsertSampleSiteRecord): Promise<SampleSiteRecord> {
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

    const response = await this.connection.sql(sqlStatement, SampleSiteRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert sample location', [
        'SampleLocationRepository->insertSampleSite',
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
   * @return {*}  {Promise<SampleSiteRecord>}
   * @memberof SampleLocationRepository
   */
  async deleteSampleSiteRecord(surveyId: number, surveySampleSiteId: number): Promise<SampleSiteRecord> {
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

    const response = await this.connection.sql(sqlStatement, SampleSiteRecord);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete survey block record', [
        'SampleLocationRepository->deleteSampleSiteRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }
}
