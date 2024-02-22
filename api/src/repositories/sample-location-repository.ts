import { Feature } from 'geojson';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { generateGeometryCollectionSQL } from '../utils/spatial-utils';
import { BaseRepository } from './base-repository';
import { SampleBlockDetails, UpdateSampleBlockRecord } from './sample-blocks-repository';
import { SampleMethodRecord, UpdateSampleMethodRecord } from './sample-method-repository';

// This describes a row in the database for Survey Sample Location
export const SampleLocationRecord = z.object({
  survey_sample_site_id: z.number(),
  survey_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  geojson: z.any(),
  geography: z.any(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type SampleLocationRecord = z.infer<typeof SampleLocationRecord>;

// This describes a row in the database for Survey Sample Location
export const SampleLocationDetails = z
  .object({
    sample_methods: z.array(SampleMethodRecord),
    sample_blocks: z.array(SampleBlockDetails)
  })
  .extend(SampleLocationRecord.shape);
export type SampleLocationDetails = z.infer<typeof SampleLocationDetails>;

// Insert Object for Sample Locations
export type InsertSampleLocationRecord = Pick<SampleLocationRecord, 'survey_id' | 'description' | 'geojson'> & {
  name: string | undefined;
};

// Update Object for Sample Locations
export type UpdateSampleLocationRecord = Pick<
  SampleLocationRecord,
  'survey_sample_site_id' | 'survey_id' | 'name' | 'description' | 'geojson'
>;

export type UpdateSampleSiteRecord = {
  survey_id: number;
  survey_sample_site_id: number;
  name: string;
  description: string;
  geojson: Feature;
  methods: UpdateSampleMethodRecord[];
  blocks: UpdateSampleBlockRecord[];
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
   * Gets all Sample Locations for a given Survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SampleLocationRecord[]>}
   * @memberof SampleLocationRepository
   */
  async getSampleLocationsForSurveyId(surveyId: number): Promise<SampleLocationDetails[]> {
    const knex = getKnex();
    const queryBuilder = knex
      .queryBuilder()
      .with('json_sample_period', (qb) => {
        // aggregate all sample periods based on method id
        qb.select('survey_sample_method_id', knex.raw('json_agg(ssp.*) as sample_periods'))
          .from({ ssp: 'survey_sample_period' })
          .groupBy('survey_sample_method_id');
      })
      .with('json_sample_methods', (qb) => {
        // join aggregated samples to methods
        // aggregate methods base on site id
        qb.select(
          'survey_sample_site_id',
          knex.raw(`
          json_agg(json_build_object(
            'sample_periods', jsp.sample_periods,
            'survey_sample_method_id', ssm.survey_sample_method_id,
            'method_lookup_id', ssm.method_lookup_id,
            'description', ssm.description,
            'create_date', ssm.create_date,
            'create_user', ssm.create_user,
            'update_date', ssm.update_date,
            'update_user', ssm.update_user,
            'survey_sample_site_id', ssm.survey_sample_site_id,
            'revision_count', ssm.revision_count
          )) as sample_methods`)
        )
          .from({ ssm: 'survey_sample_method' })
          .leftJoin('json_sample_period as jsp', 'jsp.survey_sample_method_id', 'ssm.survey_sample_method_id')
          .groupBy('ssm.survey_sample_site_id');
      })
      .with('survey_block_lookup', (qb) => {
        qb.select('survey_block_id', 'name', 'description', knex.raw('json_agg(sb.*) as block'))
          .from({ sb: 'survey_block' })
          .groupBy('sb.survey_block_id', 'name', 'description');
      })
      .with('json_sample_blocks', (qb) => {
        // aggregate all sample blocks based on site id
        qb.select(
          'survey_sample_site_id',
          knex.raw(
            `json_agg(json_build_object(
              'survey_sample_block_id', ssb.survey_sample_block_id,
              'name', sbl.name,
              'description', sbl.description,
              'survey_block_id', ssb.survey_block_id,
              'create_date', ssb.create_date,
              'create_user', ssb.create_user,
              'update_date', ssb.update_date,
              'update_user', ssb.update_user,
              'survey_sample_site_id', ssb.survey_sample_site_id,
              'revision_count', ssb.revision_count
              )) as sample_blocks`
          )
        )
          .from({ ssb: 'survey_sample_block' })
          .leftJoin('survey_block_lookup as sbl', 'sbl.survey_block_id', 'ssb.survey_block_id')
          .groupBy('ssb.survey_sample_site_id');
      })
      // join aggregated methods and blocks to sampling sites
      .select('sss.*', knex.raw("COALESCE(sample_blocks, '[]'::json) as sample_blocks"), 'sample_methods')
      .from({ sss: 'survey_sample_site' })
      .leftJoin('json_sample_blocks as jsb', 'jsb.survey_sample_site_id', 'sss.survey_sample_site_id')
      .leftJoin('json_sample_methods as jsm', 'jsm.survey_sample_site_id', 'sss.survey_sample_site_id')
      .where('sss.survey_id', surveyId)
      .orderBy('sss.survey_sample_site_id', 'asc');

    const response = await this.connection.knex(queryBuilder, SampleLocationDetails);

    return response.rows;
  }

  /**
   * updates a survey Sample Location.
   *
   * @param {UpdateSampleLocationRecord} sample
   * @return {*}  {Promise<SampleLocationRecord>}
   * @memberof SampleLocationRepository
   */
  async updateSampleLocation(sample: UpdateSampleLocationRecord): Promise<SampleLocationRecord> {
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
    const geometryCollectionSQL = generateGeometryCollectionSQL(sample.geojson);
    sql.append(geometryCollectionSQL);
    sql.append(SQL`, 4326)))`);
    sql.append(SQL`
      WHERE
        survey_sample_site_id = ${sample.survey_sample_site_id}
      RETURNING
        *;`);

    const response = await this.connection.sql(sql, SampleLocationRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update sample location record', [
        'SampleLocationRepository->updateSampleLocation',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a new survey Sample Location.
   * Business requirement to default all names to Sample Site #
   * the # is based on the current number of sample sites associated to a survey
   *
   * @param {InsertSampleLocationRecord} sample
   * @return {*}  {Promise<SampleLocationRecord>}
   * @memberof SampleLocationRepository
   */
  async insertSampleLocation(sample: InsertSampleLocationRecord): Promise<SampleLocationRecord> {
    const sqlStatement = SQL`
    INSERT INTO survey_sample_site (
      survey_id,
      name,
      description,
      geojson,
      geography
    ) VALUES (
      ${sample.survey_id},
      ${sample.name},
      ${sample.description},
      ${sample.geojson},
        `;
    const geometryCollectionSQL = generateGeometryCollectionSQL(sample.geojson);

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

    const response = await this.connection.sql(sqlStatement, SampleLocationRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert sample location', [
        'SampleLocationRepository->insertSampleLocation',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Deletes a survey Sample Location.
   *
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleLocationRecord>}
   * @memberof SampleLocationRepository
   */
  async deleteSampleLocationRecord(surveySampleSiteId: number): Promise<SampleLocationRecord> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_sample_site
      WHERE
        survey_sample_site_id = ${surveySampleSiteId}
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement, SampleLocationRecord);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete survey block record', [
        'SampleLocationRepository->deleteSampleLocationRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }
}
