import SQL from 'sql-template-strings';
import { z } from 'zod';
import { CollectionSurveyModel } from '../database-models/collection-survey';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { IPostCollection, IPostCollectionSurvey } from '../models/collection';
import { BaseRepository } from './base-repository';

export class CollectionSurveyRepository extends BaseRepository {
  /**
   * Get surveys in collection
   *
   * @param {number} collectionId - The ID of the collection to retrieve.
   * @returns {Promise<{survey_id: number}[]>} A promise resolving to the survey ids
   * @memberof CollectionRepository
   */
  async getSurveysInCollection(collectionId: number): Promise<{ survey_id: number }[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .select('survey.survey_id')
      .from('survey')
      .join('collection_survey as cs', 'cs.survey_id', 'survey.survey_id')
      .where('cs.collection_id', collectionId);

    const response = await this.connection.knex(queryBuilder, z.object({ survey_id: z.number() }));

    return response.rows;
  }

  /**
   * Get the count of surveys in the collection
   *
   * @param {number} collectionId
   * @return {*}  {Promise<number>}
   * @memberof SurveyService
   */
  async getSurveyCountByCollectionId(collectionId: number): Promise<number> {
    const sqlStatement = SQL`
        SELECT
          COUNT(*)::integer AS count
        FROM
          survey
        JOIN
            collection_survey AS cs ON survey.survey_id = cs.survey_id
        WHERE
          collection_id = ${collectionId};
      `;

    const response = await this.connection.sql(sqlStatement, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get survey count', [
        'CollectionSurveyRepository->getSurveyCountByCollection',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Create a new collection.
   *
   * @param {IPostCollectionSurvey} values
   * @returns {Promise<CollectionSurveyModel>}
   * @memberof CollectionSurveyRepository
   */
  async createCollectionSurvey(values: IPostCollectionSurvey): Promise<CollectionSurveyModel> {
    const sql = SQL`
    INSERT INTO collection_survey (collection_id, survey_id)
    VALUES (${values.collection_id}, ${values.survey_id})
    RETURNING *
  `;

    const response = await this.connection.sql(sql, CollectionSurveyModel);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to create collection', [
        'collectionSurveyRepository->createCollection',
        'rowCount was !== 1, expected rowCount === 1'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Remove a survey from a collection
   *
   * @param {number} surveyId
   * @param {number} collectionId
   * @returns {Promise<void>}
   * @memberof CollectionSurveyRepository
   */
  async deleteCollectionSurvey(surveyId: number, collectionId: number): Promise<void> {
    const sql = SQL`
    DELETE FROM collection_survey
    WHERE survey_id = ${surveyId} AND collection_id = ${collectionId};
  `;

    await this.connection.sql(sql);
  }

  /**
   * Update an existing collection.
   *
   * @param {number} collectionId - The ID of the collection to update.
   * @param {IPostCollection} data - The updated data for the collection.
   * @returns {Promise<CollectionSurveyModel>}
   * @memberof CollectionSurveyRepository
   */
  async updateCollection(collectionId: number, data: IPostCollection): Promise<CollectionSurveyModel> {
    const sql = SQL`
    UPDATE collection
    SET name = ${data.name}, description = ${data.description}
    WHERE collection_id = ${collectionId}
    RETURNING *;
  `;

    const response = await this.connection.sql(sql, CollectionSurveyModel);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to update collection', [
        'collectionSurveyRepository->updateCollection',
        'rowCount was !== 1, expected rowCount === 1'
      ]);
    }

    return response.rows[0];
  }
}
