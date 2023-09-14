import SQL from 'sql-template-strings';
import { z } from 'zod';
import { PostLocationData } from '../models/survey-create';
import { PutSurveyLocationData } from '../models/survey-update';
import { generateGeometryCollectionSQL } from '../utils/spatial-utils';
import { BaseRepository } from './base-repository';

export const SurveyLocationRecord = z.object({
  survey_location_id: z.number(),
  name: z.string(),
  description: z.string(),
  geography: z.any(),
  geojson: z.any(),
  geometry: z.any().nullable(),
  revision_count: z.number()
});

export type SurveyLocationRecord = z.infer<typeof SurveyLocationRecord>;
export class SurveyLocationRepository extends BaseRepository {
  async insertSurveyLocation(surveyId: number, data: PostLocationData): Promise<void> {
    const sql = SQL`
      INSERT INTO survey_location (
        survey_id,
        name, 
        description,         
        geojson,
        geography
      ) 
      VALUES (
        ${surveyId},
        ${data.name},
        ${data.description},
        ${JSON.stringify(data.geojson)},
    `;

    // TODO rework this so it's easier to read
    sql.append(SQL`public.geography(
      public.ST_Force2D(
        public.ST_SetSRID(`);

    sql.append(generateGeometryCollectionSQL(data.geojson));

    sql.append(SQL`, 4326)))`);

    sql.append(SQL`);`);
    await this.connection.sql(sql);
  }

  async updateSurveyLocation(data: PutSurveyLocationData): Promise<void> {
    const sql = SQL`
      UPDATE 
        survey_location
      SET 
        name = ${data.name},
        description = ${data.description},
        geojson = ${JSON.stringify(data.geojson)},
        geography = 
    `;

    sql.append(SQL`public.geography(
      public.ST_Force2D(
        public.ST_SetSRID(`);

    sql.append(generateGeometryCollectionSQL(data.geojson));

    sql.append(SQL`, 4326)))`);

    sql.append(SQL`
    WHERE 
        survey_location_id = ${data.survey_location_id};
    `);
    console.log(sql.sql);
    await this.connection.sql(sql);
  }

  /**
   * Get Survey location for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} Promise<GetSurveyLocationData[]>
   * @memberof SurveyRepository
   */
  async getSurveyLocationsData(surveyId: number): Promise<SurveyLocationRecord[]> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        survey_location
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, SurveyLocationRecord);
    return response.rows;
  }
}
