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

    return (
      queryBuilder

        // CTE for user roles
        .with('user_roles', (qb) => {
          qb.select(
            'sur.system_user_id',
            knex.raw(`array_agg(DISTINCT sr.system_role_id) FILTER (WHERE sr.system_role_id IS NOT NULL) AS role_ids`),
            knex.raw(`array_agg(DISTINCT sr.name) FILTER (WHERE sr.name IS NOT NULL) AS role_names`)
          )
            .from('system_user_role AS sur')
            .leftJoin('system_role AS sr', 'sr.system_role_id', 'sur.system_role_id')
            .groupBy('sur.system_user_id');
        })

        .withRecursive('collection_tree', (qb) => {
          // Non-recursive part: Select the root collections (those with no parent)
          qb.select(
            'c.collection_id',
            'c.name',
            'c.description',
            'c.parent_collection_id',
            knex.raw(`'[]'::jsonb AS subcollections`)
          )
            .from('collection AS c')
            .whereNull('c.parent_collection_id') // Only root collections (no parent)
            .unionAll(function () {
              // Recursive part: Select subcollections and join to previously selected collections
              this.select(
                'c.collection_id',
                'c.name',
                'c.description',
                'c.parent_collection_id',
                knex.raw(`'[]'::jsonb AS subcollections`)
              )
                .from('collection AS c')
                .join('collection_tree AS ct', 'c.parent_collection_id', 'ct.collection_id'); // Recursively join to the previous result
            });
        })

        // CTE for collection members (participants)
        .with('collection_members', (qb) => {
          qb.select(
            'cm.collection_id',
            knex.raw(`COALESCE(
              jsonb_agg(DISTINCT jsonb_build_object(
                'collection_member_id', cm.collection_member_id,
                'collection_id', cm.collection_id,
                'system_user_id', su.system_user_id,
                'user_identifier', su.user_identifier,
                'user_guid', su.user_guid,
                'identity_source', uis.name,
                'email', su.email,
                'display_name', su.display_name,
                'collection_role_id', cr.collection_role_id,
                'collection_role_name', cr.name
              )) FILTER (WHERE su.system_user_id IS NOT NULL), '[]'::jsonb) AS participants`)
          )
            .from('collection_member AS cm')
            .join('collection_role as cr', 'cm.collection_role_id', 'cr.collection_role_id')
            .leftJoin('system_user AS su', 'su.system_user_id', 'cm.system_user_id')
            .leftJoin('user_identity_source AS uis', 'uis.user_identity_source_id', 'su.user_identity_source_id')
            .groupBy('cm.collection_id');
        })
        // Get child-parent relationships for constructing subcollections
        .with('collection_relations', (qb) => {
          qb.select('ct.*').from('collection_tree AS ct');
        })
        // Use a non-recursive CTE to build the final JSON structure
        .with('collection_json', (qb) => {
          qb.select(
            'cr.collection_id',
            'cr.name',
            'cr.description',
            'cr.parent_collection_id',
            knex.raw(`
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'collection_id', child.collection_id,
                    'name', child.name,
                    'description', child.description,
                    'parent_collection_id', child.parent_collection_id,
                    'participants', COALESCE(child_members.participants, '[]'::jsonb)
                  )
                )
                FROM collection_relations child
                LEFT JOIN collection_members child_members ON child_members.collection_id = child.collection_id
                WHERE child.parent_collection_id = cr.collection_id
              ) AS subcollections
            `),
            knex.raw(`COALESCE(cm.participants, '[]'::jsonb) AS participants`)
          )
            .from('collection_relations AS cr')
            .leftJoin('collection_members AS cm', 'cm.collection_id', 'cr.collection_id');
        })
        // Main query to fetch final result - only root collections
        .select(
          'collection.collection_id',
          'collection.name',
          'collection.description',
          'collection.parent_collection_id',
          'collection.subcollections',
          'collection.participants'
        )
        .from('collection_json AS collection')
        .whereNull('collection.parent_collection_id')
    );
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
   * Base query for finding collections with filters and permissions.
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
      getCollectionIdsQuery.whereIn('collection.collection_id', (subquery) =>
        subquery
          .select('collection_id')
          .from('collection')
          .leftJoin('collection_member', 'collection_member.collection_id', 'collection.collection_id')
          .where('collection_member.system_user_id', systemUserId)
      );
    }

    if (filterFields.system_user_id) {
      getCollectionIdsQuery.whereIn('collection.collection_id', (subquery) =>
        subquery.select('collection_id').from('collection_member').where('system_user_id', filterFields.system_user_id)
      );
    }

    // If the request had parent_collection_id defined but equal to null, we want to filter using null. We only ignore the filter parameter if it is undefined.
    if (filterFields.parent_collection_id !== undefined) {
      getCollectionIdsQuery.whereIn('collection.collection_id', (subquery) => {
        const sub = subquery.select('collection_id').from('collection_member');

        if (filterFields.parent_collection_id === null) {
          return sub.whereNull('parent_collection_id');
        } else {
          return sub.where('parent_collection_id', filterFields.parent_collection_id);
        }
      });
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

    const response = await this.connection.knex(query);

    console.log(response.rows, response.rows[0].subcollections, 'rows!');
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
    INSERT INTO collection (name, description, parent_collection_id)
    VALUES (${data.name}, ${data.description}, ${data.parent_collection_id})
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
