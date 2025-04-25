import { SQL, SQLStatement } from 'sql-template-strings';
import { IDBConnection } from '../database/db';
import { BaseRepository } from './base-repository';
import { ApiPaginationOptions } from '../types/common';
import { FindCollectionsResponse, ICollectionAdvancedFilters } from '../models/collection-view';
import { getKnex } from '../database/db';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import Knex from 'knex';

/**
 * Repository for collection database operations.
 *
 * @export
 * @class CollectionRepository
 * @extends {BaseRepository}
 */
export class CollectionRepository extends BaseRepository {
  constructor(connection: IDBConnection) {
    super(connection);
  }

  /**
   * Constructs a non-paginated query used to get a list of collections based on the user's permissions and filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ICollectionAdvancedFilters} filterFields
   * @return {*}  {Knex.QueryBuilder}
   * @memberof CollectionRepository
   */
  _makeFindCollectionsQuery(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ICollectionAdvancedFilters
  ): Knex.QueryBuilder {
    const knex = getKnex();

    const query = knex
      .select([
        'c.collection_id',
        'c.name',
        'c.objectives',
        knex.raw(`
          array_agg(
            DISTINCT jsonb_build_object(
              'system_user_id', su.system_user_id,
              'display_name', su.display_name
            )
          ) as members
        `)
      ])
      .from('collection as c')
      .leftJoin('collection_participation as cp', 'c.collection_id', 'cp.collection_id')
      .leftJoin('system_user as su', 'cp.system_user_id', 'su.system_user_id')
      .where('c.record_end_date', null)
      .groupBy(['c.collection_id', 'c.name', 'c.objectives']);

    // Ensure that users can only see collections that they are participating in, unless they are an administrator.
    if (!isUserAdmin && systemUserId) {
      query.whereIn('c.collection_id', (subQueryBuilder) => {
        subQueryBuilder.select('collection_id').from('collection_participation').where('system_user_id', systemUserId);
      });
    }

    if (filterFields.system_user_id) {
      query.whereIn('c.collection_id', (subQueryBuilder) => {
        subQueryBuilder
          .select('collection_id')
          .from('collection_participation')
          .where('system_user_id', filterFields.system_user_id);
      });
    }

    // Keyword Search filter
    if (filterFields.keyword) {
      const keywordMatch = `%${filterFields.keyword}%`;
      query.where((subQueryBuilder) => {
        subQueryBuilder
          .where('c.name', 'ilike', keywordMatch)
          .orWhere('c.objectives', 'ilike', keywordMatch);

        // If the keyword is a number, also match on collection Id
        if (!isNaN(Number(filterFields.keyword))) {
          subQueryBuilder.orWhere('c.collection_id', Number(filterFields.keyword));
        }
      });
    }

    return query;
  }

  /**
   * Returns the total count of collections that are visible to the given user.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ICollectionAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof CollectionRepository
   */
  async findCollectionsCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ICollectionAdvancedFilters
  ): Promise<number> {
    const collectionsListQuery = this._makeFindCollectionsQuery(isUserAdmin, systemUserId, filterFields);

    const knex = getKnex();

    // See https://knexjs.org/guide/query-builder.html#usage-with-typescript-3 for details on count() usage
    const query = knex.from(collectionsListQuery.as('clq')).select(knex.raw('count(*)::integer as count'));

    const response = await this.connection.knex(query, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get collection count', [
        'CollectionRepository->findCollectionsCount',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Retrieves the paginated list of all collections that are available to the user.
   * 
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {ICollectionAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<FindCollectionsResponse[]>}
   * @memberof CollectionRepository
   */
  async findCollections(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ICollectionAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindCollectionsResponse[]> {
    const query = this._makeFindCollectionsQuery(isUserAdmin, systemUserId, filterFields);

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, FindCollectionsResponse);

    return response.rows;
  }

  /**
   * Fetch all collections.
   *
   * @return {*}  {Promise<any[]>}
   * @memberof CollectionRepository
   */
  async getAllCollections(): Promise<any[]> {
    const sql: SQLStatement = SQL`
      SELECT
        collection_id,
        name,
        objectives
      FROM
        collection
      WHERE
        record_end_date IS NULL
      ORDER BY
        name ASC;
    `;

    const response = await this.connection.sql(sql);

    return response.rows;
  }

  /**
   * Create a new collection.
   *
   * @param {*} collectionData
   * @return {*}  {Promise<any>}
   * @memberof CollectionRepository
   */
  async createCollection(collectionData: { name: string; objectives: string }): Promise<any> {
    const sql: SQLStatement = SQL`
      INSERT INTO collection (
        name,
        objectives,
        create_date,
        create_user
      ) VALUES (
        ${collectionData.name},
        ${collectionData.objectives},
        now()
      )
      RETURNING
        collection_id,
        name,
        objectives;
    `;

    const response = await this.connection.sql(sql);

    return response.rows[0];
  }

  /**
   * Fetch a collection by ID.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<any>}
   * @memberof CollectionRepository
   */
  async getCollectionById(collectionId: number): Promise<any> {
    const sql: SQLStatement = SQL`
      SELECT
        collection_id,
        name,
        objectives
      FROM
        collection
      WHERE
        collection_id = ${collectionId}
        AND record_end_date IS NULL;
    `;

    const response = await this.connection.sql(sql);

    if (!response.rows.length) {
      return null;
    }

    return response.rows[0];
  }

  /**
   * Update a collection by ID.
   *
   * @param {number} collectionId
   * @param {*} collectionData
   * @return {*}  {Promise<any>}
   * @memberof CollectionRepository
   */
  async updateCollection(
    collectionId: number,
    collectionData: { name?: string; objectives?: string }
  ): Promise<any> {
    // Start building the SQL query
    let sql = SQL`
      UPDATE collection
      SET
        update_date = now(),
        update_user = 1 -- Replace with actual user ID
    `;

    // Add optional fields to update
    if (collectionData.name !== undefined) {
      sql = sql.append(SQL`, name = ${collectionData.name}`);
    }

    if (collectionData.objectives !== undefined) {
      sql = sql.append(SQL`, objectives = ${collectionData.objectives}`);
    }

    // Complete the query
    sql = sql.append(SQL`
      WHERE
        collection_id = ${collectionId}
        AND record_end_date IS NULL
      RETURNING
        collection_id,
        name,
        objectives;
    `);

    const response = await this.connection.sql(sql);

    if (!response.rows.length) {
      return null;
    }

    return response.rows[0];
  }

  /**
   * Delete a collection by ID.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<boolean>}
   * @memberof CollectionRepository
   */
  async deleteCollection(collectionId: number): Promise<boolean> {
    const sql: SQLStatement = SQL`
      UPDATE collection
      SET
        record_end_date = now(),
        update_date = now(),
        update_user = 1 -- Replace with actual user ID
      WHERE
        collection_id = ${collectionId}
        AND record_end_date IS NULL;
    `;

    const response = await this.connection.sql(sql);

    return response.rowCount !== null && response.rowCount > 0;
  }
}