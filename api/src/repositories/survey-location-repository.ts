import SQL from 'sql-template-strings';
import { PostLocationData } from '../models/survey-create';
import { generateGeometryCollectionSQL } from '../utils/spatial-utils';
import { BaseRepository } from './base-repository';

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
        ${JSON.stringify(data.geometry)},
    `;

    // should be a cleaner way to do this...
    sql.append(SQL`public.geography(
      public.ST_Force2D(
        public.ST_SetSRID(`);

    sql.append(generateGeometryCollectionSQL(data.geometry));

    sql.append(SQL`, 4326)))`);

    sql.append(SQL`);`);
    await this.connection.sql(sql);
  }
}
