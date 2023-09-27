import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { generateGeometryCollectionSQL } from '../utils/spatial-utils';
import { BaseRepository } from './base-repository';
import { SampleMethodRecord } from './sample-method-repository';

// This describes a row in the database for Survey Sample Location
export const SampleLocationRecord = z.object({
  survey_sample_site_id: z.number(),
  survey_id: z.number(),
  name: z.string(),
  description: z.string(),
  geojson: z.any(),
  geography: z.any(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number(),
  sample_methods: z.array(SampleMethodRecord).default([])
});
export type SampleLocationRecord = z.infer<typeof SampleLocationRecord>;

// Insert Object for Sample Locations
export type InsertSampleLocationRecord = Pick<SampleLocationRecord, 'survey_id' | 'name' | 'description' | 'geojson'>;

// Update Object for Sample Locations
export type UpdateSampleLocationRecord = Pick<
  SampleLocationRecord,
  'survey_sample_site_id' | 'survey_id' | 'name' | 'description' | 'geojson'
>;

/**
 * Sample Location Repository
 *
 * @export
 * @class SampleLocationRepository
 * @extends {BaseRepository}
 */
export class SampleLocationRepository extends BaseRepository {
  /**
   * Gets all survey Sample Locations.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SampleLocationRecord[]>}
   * @memberof SampleLocationRepository
   */
  async getSampleLocationsForSurveyId(surveyId: number): Promise<SampleLocationRecord[]> {
    const sql = SQL`
    SELECT sss.survey_sample_site_id, sss.survey_id, sss.name, sss.description, sss.geojson, sss.geography, sss.create_date, sss.create_user, sss.update_date, sss.update_user, sss.revision_count, json_agg(gssm.*) as sample_methods
    FROM survey_sample_site sss, (
      SELECT ssm.survey_sample_method_id, ssm.survey_sample_site_id, ssm.method_lookup_id, ssm.description, ssm.create_date, ssm.create_user, ssm.update_date, ssm.update_user, ssm.revision_count, json_agg(ssp.*) as sample_periods
      FROM survey_sample_method ssm, survey_sample_period ssp
      WHERE ssm.survey_sample_method_id = ssp.survey_sample_method_id 
      GROUP BY ssm.survey_sample_method_id, ssm.survey_sample_site_id, ssm.method_lookup_id, ssm.description, ssm.create_date, ssm.create_user, ssm.update_date, ssm.update_user, ssm.revision_count
    ) gssm
    WHERE sss.survey_sample_site_id = gssm.survey_sample_site_id
    AND sss.survey_id = ${surveyId}
    GROUP BY sss.survey_sample_site_id, sss.survey_id, sss.name, sss.description, sss.geojson, sss.geography, sss.create_date, sss.create_user, sss.update_date, sss.update_user, sss.revision_count
    ORDER BY sss.survey_sample_site_id;
    `;

    const response = await this.connection.sql(sql, SampleLocationRecord);
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
      UPDATE survey_sample_site
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
      (SELECT concat('Sample Site ', (SELECT count(survey_sample_site_id) + 1 FROM survey_sample_site sss WHERE survey_id = ${sample.survey_id}))),
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
