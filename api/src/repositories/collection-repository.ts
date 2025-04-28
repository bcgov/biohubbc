import { Knex } from 'knex';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { CollectionModel } from '../database-models/collection';
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
    const knex = getKnex();
    const query = queryBuilder
      .with('user_roles', (qb) => {
        qb.select(
          'sur.system_user_id',
          knex.raw('array_agg(DISTINCT sr.system_role_id) FILTER (WHERE sr.system_role_id IS NOT NULL) AS role_ids'),
          knex.raw('array_agg(DISTINCT sr.name) FILTER (WHERE sr.name IS NOT NULL) AS role_names')
        )
          .from('system_user_role AS sur')
          .leftJoin('system_role AS sr', 'sr.system_role_id', 'sur.system_role_id')
          .groupBy('sur.system_user_id');
      })
      .select(
        'collection.collection_id',
        'collection.name',
        'collection.description',
        knex.raw(`
      COALESCE(
        jsonb_agg(
          DISTINCT jsonb_build_object(
            'collection_member_id', cp.collection_member_id,
            'collection_id', cp.collection_id,
            'system_user_id', su.system_user_id,
            'user_identifier', su.user_identifier,
            'user_guid', su.user_guid,
            'identity_source', uis.name,
            'email', su.email,
            'display_name', su.display_name,
            'given_name', su.given_name,
            'family_name', su.family_name,
            'agency', su.agency,
            'collection_role_id', cp.collection_role_id,
            'collection_role_name', cr.name,
            'role_ids', ur.role_ids,
            'role_names', ur.role_names
          )
        ) FILTER (WHERE su.system_user_id IS NOT NULL),
        '[]'::jsonb
      ) AS participants
    `)
      )
      .from('collection')
      .leftJoin('collection_member AS cp', 'cp.collection_id', 'collection.collection_id')
      .leftJoin('collection_role AS cr', 'cr.collection_role_id', 'cp.collection_role_id')
      .leftJoin('system_user AS su', (qb) => {
        qb.on('su.system_user_id', '=', 'cp.system_user_id').andOnNull('su.record_end_date');
      })
      .leftJoin('user_identity_source AS uis', 'uis.user_identity_source_id', 'su.user_identity_source_id')
      .leftJoin('user_roles AS ur', 'ur.system_user_id', 'su.system_user_id')
      .groupBy('collection.collection_id');

    return query;
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
      getCollectionIdsQuery.whereIn('collection.survey_id', (subquery) =>
        subquery
          .select('survey_id')
          .from('survey')
          .leftJoin('survey_member', 'survey_member.survey_id', 'survey.survey_id')
          .where('survey_member.system_user_id', systemUserId)
      );
    }

    if (filterFields.system_user_id) {
      getCollectionIdsQuery.whereIn('collection.survey_id', (subquery) =>
        subquery.select('survey_id').from('survey_member').where('system_user_id', filterFields.system_user_id)
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
   * @returns {Promise<CollectionModel>}
   * @memberof CollectionRepository
   */
  async createCollection(data: IPostCollection): Promise<CollectionModel> {
    const sql = SQL`
    INSERT INTO collection (name, description)
    VALUES (${data.name}, ${data.description})
    RETURNING *
  `;

    const response = await this.connection.sql(sql, CollectionModel);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to create collection', [
        'collectionRepository->createCollection',
        'rowCount was !== 1, expected rowCount === 1'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Update an existing collection.
   *
   * @param {number} collectionId - The ID of the collection to update.
   * @param {IPostCollection} data - The updated data for the collection.
   * @returns {Promise<CollectionModel>}
   * @memberof CollectionRepository
   */
  async updateCollection(collectionId: number, data: IPostCollection): Promise<CollectionModel> {
    const sql = SQL`
    UPDATE collection
    SET name = ${data.name}, description = ${data.description}
    WHERE collection_id = ${collectionId}
    RETURNING *;
  `;

    const response = await this.connection.sql(sql, CollectionModel);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to update collection', [
        'collectionRepository->updateCollection',
        'rowCount was !== 1, expected rowCount === 1'
      ]);
    }

    return response.rows[0];
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
