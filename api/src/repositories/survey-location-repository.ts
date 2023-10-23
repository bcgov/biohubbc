import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { PostSurveyLocationData } from '../models/survey-update';
import { generateGeometryCollectionSQL } from '../utils/spatial-utils';
import { shallowJsonSchema } from '../zod-schema/json';
import { BaseRepository } from './base-repository';

export const SurveyLocationRecord = z.object({
  survey_location_id: z.number(),
  name: z.string(),
  description: z.string(),
  geometry: z.record(z.any()).nullable(),
  geography: z.string(),
  geojson: shallowJsonSchema,
  revision_count: z.number()
});

export type SurveyLocationRecord = z.infer<typeof SurveyLocationRecord>;
export class SurveyLocationRepository extends BaseRepository {
  /**
   * Creates a survey location for a given survey
   *
   * @param {number} surveyId
   * @param {PostSurveyLocationData} data
   * @memberof SurveyLocationRepository
   */
  async insertSurveyLocation(surveyId: number, data: PostSurveyLocationData): Promise<void> {
    const sqlStatement = SQL`
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
        public.geography(
          public.ST_Force2D(
            public.ST_SetSRID(`.append(generateGeometryCollectionSQL(data.geojson)).append(`, 4326)
          )
        )
      );`);
    await this.connection.sql(sqlStatement);
  }

  /**
   * Updates survey location data
   *
   * @param {PostSurveyLocationData} data
   * @memberof SurveyLocationRepository
   */
  async updateSurveyLocation(data: PostSurveyLocationData): Promise<void> {
    const sqlStatement = SQL`
      UPDATE 
        survey_location
      SET 
        name = ${data.name},
        description = ${data.description},
        geojson = ${JSON.stringify(data.geojson)},
        geography = public.geography(
                      public.ST_Force2D(
                        public.ST_SetSRID(`.append(generateGeometryCollectionSQL(data.geojson)).append(`, 4326)
                      )
                    )
      WHERE 
        survey_location_id = ${data.survey_location_id};
    `);

    await this.connection.sql(sqlStatement);
  }

  /**
   * Get Survey location for a given survey ID
   *
   * @param {number} surveyId
   * @returns {*} Promise<GetSurveyLocationData[]>
   * @memberof SurveyLocationRepository
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

  /**
   * Deletes a survey location for a given survey location id
   *
   * @param surveyLocationId
   * @returns {*} Promise<GetSurveyLocationData[]>
   * @memberof SurveyLocationRepository
   */
  async deleteSurveyLocation(surveyLocationId: number): Promise<SurveyLocationRecord> {
    const sql = SQL`
    DELETE FROM survey_location WHERE survey_location_id = ${surveyLocationId} RETURNING *;`;
    const response = await this.connection.sql(sql, SurveyLocationRecord);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete survey location record', [
        'SurveyLocationRepository->deleteSurveyLocation',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }
}
