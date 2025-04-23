import { Knex } from 'knex';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { Collection, ICollectionAdvancedFilters, IPostCollection } from '../models/collection';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';

export class CollectionRepository extends BaseRepository {
  /**
   * Get the base query for retrieving collections with participants.
   *
   * @param {Knex.QueryBuilder} queryBuilder - A Knex query builder to modify.
   * @returns {Knex.QueryBuilder} The modified query builder including participants.
   * @memberof CollectionRepository
   */
  _getCollectionsBaseQuery(queryBuilder: Knex.QueryBuilder): Knex.QueryBuilder {
    return queryBuilder
      .select(
        'collection.collection_id',
        'collection.name',
        'collection.description',
        getKnex().raw(`
        COALESCE(
          jsonb_agg(
            DISTINCT jsonb_build_object('system_user_id', cp.system_user_id)
          ) FILTER (WHERE cp.system_user_id IS NOT NULL),
          '[]'::jsonb
        ) AS participants
      `)
      )
      .from('collection')
      .leftJoin('collection_participation AS cp', 'cp.collection_id', 'collection.collection_id')
      .groupBy('collection.collection_id');
  }

  /**
   * Get a collection by ID.
   *
   * @param {number} collectionId - The ID of the collection to retrieve.
   * @returns {Promise<Collection>} A promise resolving to the collection.
   * @memberof CollectionRepository
   */
  async getCollectionById(collectionId: number): Promise<Collection> {
    const knex = getKnex();
    const baseQuery = knex.queryBuilder();
    this._getCollectionsBaseQuery(baseQuery);
    const query = baseQuery.where('collection.collection_id', collectionId);

    const response = await this.connection.knex(query, Collection);
    return response.rows[0];
  }

  /**
   * Create a base query for finding collections with filters and permissions.
   *
   * @param {boolean} isUserAdmin - Whether the user has admin privileges.
   * @param {number | null} systemUserId - The ID of the system user.
   * @param {ICollectionAdvancedFilters} filterFields - The fields to filter by.
   * @returns {Knex.QueryBuilder} The Knex query builder with filters applied.
   * @memberof CollectionRepository
   */
  _makeFindCollectionsBaseQuery(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ICollectionAdvancedFilters
  ): Knex.QueryBuilder {
    const knex = getKnex();
    const getCollectionIdsQuery = knex.select('collection_id').from('collection');

    if (!isUserAdmin) {
      getCollectionIdsQuery.whereIn('collection.project_id', (subquery) =>
        subquery
          .select('project_id')
          .from('project')
          .leftJoin('project_participation', 'project_participation.project_id', 'project.project_id')
          .where('project_participation.system_user_id', systemUserId)
      );
    }

    if (filterFields.system_user_id) {
      getCollectionIdsQuery.whereIn('collection.project_id', (subquery) =>
        subquery.select('project_id').from('project_participation').where('system_user_id', filterFields.system_user_id)
      );
    }

    const query = getKnex().queryBuilder();
    this._getCollectionsBaseQuery(query);
    query.whereIn('collection.collection_id', getCollectionIdsQuery);

    return query;
  }

  /**
   * Retrieve a list of collections with optional filters and pagination.
   *
   * @param {boolean} isUserAdmin - Whether the user is an admin.
   * @param {number | null} systemUserId - The system user ID.
   * @param {ICollectionAdvancedFilters} filterFields - Filters to apply.
   * @param {ApiPaginationOptions} [pagination] - Optional pagination parameters.
   * @returns {Promise<Collection[]>} A promise resolving to an array of collections.
   * @memberof CollectionRepository
   */
  async findCollections(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ICollectionAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<Collection[]> {
    const query = this._makeFindCollectionsBaseQuery(isUserAdmin, systemUserId, filterFields);

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, Collection);
    return response.rows;
  }

  /**
   * Create a new collection.
   *
   * @param {IPostCollection} data - The data for the new collection.
   * @returns {Promise<void>}
   * @memberof CollectionRepository
   */
  async createCollection(data: IPostCollection): Promise<void> {
    const sql = SQL`
    INSERT INTO collection (name, description)
    VALUES (${data.name}, ${data.description});
  `;

    const response = await this.connection.sql(sql);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to create collection', [
        'collectionRepository->createCollection',
        'rowCount was !== 1, expected rowCount === 1'
      ]);
    }
  }

  /**
   * Update an existing collection.
   *
   * @param {number} collectionId - The ID of the collection to update.
   * @param {IPostCollection} data - The updated data for the collection.
   * @returns {Promise<void>}
   * @memberof CollectionRepository
   */
  async updateCollection(collectionId: number, data: IPostCollection): Promise<void> {
    const sql = SQL`
    UPDATE collection
    SET name = ${data.name}, description = ${data.description}
    WHERE collection_id = ${collectionId}
  `;

    const response = await this.connection.sql(sql);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to update collection', [
        'collectionRepository->updateCollection',
        'rowCount was !== 1, expected rowCount === 1'
      ]);
    }
  }

  /**
   * Count of the number of collections accessible to a user.
   *
   * @param {boolean} isUserAdmin - Whether the user has admin rights.
   * @param {number | null} systemUserId - The ID of the system user.
   * @param {ICollectionAdvancedFilters} filterFields - The fields to filter collections by.
   * @returns {Promise<number>} The total number of accessible collections.
   * @memberof CollectionRepository
   */
  async findCollectionsCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ICollectionAdvancedFilters
  ): Promise<number> {
    const knex = getKnex();
    const baseQuery = this._makeFindCollectionsBaseQuery(isUserAdmin, systemUserId, filterFields);
    const countQuery = knex.from(baseQuery.as('sub')).select(knex.raw('count(*)::integer as count'));

    const response = await this.connection.knex(countQuery, z.object({ count: z.number() }));
    return response.rows[0].count;
  }
}
