import { Feature, FeatureCollection } from 'geojson';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { generateGeometryCollectionSQL } from '../utils/spatial-utils';
import { BaseRepository } from './base-repository';

export interface PostSampleLocation {
  survey_sample_site_id: number | null;
  survey_id: number;
  name: string;
  description: string;
  survey_sample_site: Feature;
}

export interface PostSampleLocations {
  survey_sample_site_id: number | null;
  survey_id: number;
  name: string;
  description: string;
  survey_sample_sites: FeatureCollection;
}

// This describes the a row in the database for Survey Block
export const SampleLocationRecord = z.object({
  survey_sample_site_id: z.number(),
  survey_id: z.number(),
  geojson: z.any(),
  geography: z.any(),
  description: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type SampleLocationRecord = z.infer<typeof SampleLocationRecord>;

/**
 * Sample Repository
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
      SELECT *
      FROM survey_sample_site
      WHERE survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sql, SampleLocationRecord);
    return response.rows || [];
  }

  /**
   * updates a survey Sample Location.
   *
   * @param {PostSampleLocation} sample
   * @return {*}  {Promise<SampleLocationRecord>}
   * @memberof SampleLocationRepository
   */
  async updateSampleLocation(sample: PostSampleLocation): Promise<SampleLocationRecord> {
    const sql = SQL`
      UPDATE survey_sample_site
      SET
        survey_id=${sample.survey_id},
        name=${sample.name},
        description=${sample.description},
        geojson=${sample.survey_sample_site},
        geography=public.geography(
          public.ST_Force2D(
            public.ST_SetSRID(
    `;
    const geometryCollectionSQL = generateGeometryCollectionSQL(sample.survey_sample_site);
    sql.append(geometryCollectionSQL);
    sql.append(SQL`, 4326)))`);
    sql.append(SQL`
        )
        WHERE
        survey_sample_site_id = ${sample.survey_sample_site_id}
      RETURNING
        *;`);

    const response = await this.connection.sql(sql, SampleLocationRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update survey block', [
        'SampleLocationRepository->updateSampleLocation',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a new survey Sample Location.
   *
   * @param {PostSampleLocation} sample
   * @return {*}  {Promise<SampleLocationRecord>}
   * @memberof SampleLocationRepository
   */
  async insertSampleLocation(sample: PostSampleLocation): Promise<SampleLocationRecord> {
    const sqlStatement = SQL`
    INSERT INTO survey_sample_site (
      survey_id,
      name,
      description,
      geojson,
      geography,
    ) VALUES (
      ${sample.survey_id},
      ${sample.name},
      ${sample.description},
      ${sample.survey_sample_site},
      `;
    const geometryCollectionSQL = generateGeometryCollectionSQL(sample.survey_sample_site);

    sqlStatement.append(SQL`
        ,public.geography(
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
