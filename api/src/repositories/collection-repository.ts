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
   * Flat collection structure with participants only.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @returns {Knex.QueryBuilder}
   */
  _getCollectionsFlatQuery(queryBuilder: Knex.QueryBuilder): Knex.QueryBuilder {
    const knex = getKnex();

    return queryBuilder
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
      .select(
        'collection.collection_id',
        'collection.name',
        'collection.description',
        'collection.parent_collection_id',
        knex.raw(`'[]'::jsonb AS subcollections`),
        knex.raw("COALESCE(cm.participants, '[]'::jsonb) AS participants")
      )
      .from('collection')
      .leftJoin('collection_members AS cm', 'cm.collection_id', 'collection.collection_id');
  }

  /**
   * Get the base query for retrieving collections with nested subcollections and participants.
   *
   * @param {Knex.QueryBuilder} queryBuilder - A Knex query builder to modify.
   * @param {ICollectionAdvancedFilters} filterFields
   * @returns {Knex.QueryBuilder}
   */
  _getCollectionsHierarchyBaseQuery(
    queryBuilder: Knex.QueryBuilder,
    filterFields?: ICollectionAdvancedFilters
  ): Knex.QueryBuilder {
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

        // Recursive CTE for collection hierarchy
        .withRecursive('collection_hierarchy', (qb) => {
          const base = qb
            .select('c.collection_id', 'c.name', 'c.description', 'c.parent_collection_id')
            .from('collection AS c');

          const parentId = filterFields?.parent_collection_id;
          const includeChildren = filterFields?.include_children !== false;

          if (!includeChildren) {
            if (parentId) {
              base.where('c.collection_id', parentId);
            } else {
              base.whereNull('c.parent_collection_id');
            }
            return base;
          }

          if (parentId) {
            base.where('c.parent_collection_id', parentId);
          } else {
            base.whereNull('c.parent_collection_id');
          }

          return base.unionAll(function () {
            this.select('c.collection_id', 'c.name', 'c.description', 'c.parent_collection_id')
              .from('collection AS c')
              .join('collection_hierarchy AS ch', 'c.parent_collection_id', 'ch.collection_id');
          });
        })

        // Collection members
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

        // Merge subcollections and participants
        .with('collection_with_subcollections', (qb) => {
          qb.select(
            'ch.collection_id',
            'ch.name',
            'ch.description',
            'ch.parent_collection_id',
            knex.raw(`COALESCE(cm.participants, '[]'::jsonb) AS participants`),
            knex.raw("'[]'::jsonb AS subcollections")
          )
            .from('collection_hierarchy AS ch')
            .leftJoin('collection_members AS cm', 'cm.collection_id', 'ch.collection_id');
        })

        // Nest children into subcollections
        .with('final_collection_structure', (qb) => {
          qb.select(
            'c.collection_id',
            'c.name',
            'c.description',
            'c.parent_collection_id',
            'c.participants',
            knex.raw(`
          COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'collection_id', child.collection_id,
                'name', child.name,
                'description', child.description,
                'parent_collection_id', child.parent_collection_id,
                'participants', child.participants,
                'subcollections', child.subcollections
              )
            ) FILTER (WHERE child.collection_id IS NOT NULL),
            '[]'::jsonb
          ) AS subcollections
        `)
          )
            .from('collection_with_subcollections AS c')
            .leftJoin('collection_with_subcollections AS child', 'child.parent_collection_id', 'c.collection_id')
            .groupBy('c.collection_id', 'c.name', 'c.description', 'c.parent_collection_id', 'c.participants');
        })

        // Final output
        .select(
          'collection.collection_id',
          'collection.name',
          'collection.description',
          'collection.parent_collection_id',
          'collection.participants',
          'collection.subcollections'
        )
        .from('final_collection_structure AS collection')
        .orderBy('collection.collection_id')
    );
  }

  /**
   * Base query for finding collections with filters and permissions (no children).
   *
   * @param {boolean} isUserAdmin
   * @param {number | null} systemUserId
   * @param {ICollectionAdvancedFilters} filterFields
   * @returns {Knex.QueryBuilder}
   */
  _findCollectionsBaseQuery(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ICollectionAdvancedFilters
  ): Knex.QueryBuilder {
    const knex = getKnex();

    const getCollectionIdsQuery = knex.select('collection_id').from('collection');

    if (!isUserAdmin) {
      getCollectionIdsQuery.whereIn('collection.collection_id', (subquery) =>
        subquery.select('collection_id').from('collection_member').where('system_user_id', systemUserId)
      );
    }

    if (filterFields.system_user_id) {
      getCollectionIdsQuery.whereIn('collection.collection_id', (subquery) =>
        subquery.select('collection_id').from('collection_member').where('system_user_id', filterFields.system_user_id)
      );
    }

    if (filterFields.parent_collection_id && !filterFields.include_children) {
      getCollectionIdsQuery.where('collection.parent_collection_id', filterFields.parent_collection_id);
    }

    const query = knex.queryBuilder();
    this._getCollectionsFlatQuery(query); // Reusable basic info only

    query.whereIn('collection.collection_id', getCollectionIdsQuery);
    return query;
  }

  /**
   * Get a collection by ID, including nested subcollections and participants.
   *
   * @param {number} collectionId - The ID of the collection to retrieve.
   * @returns {Promise<Collection>} A promise resolving to the collection.
   * @memberof CollectionRepository
   */
  async getCollectionById(collectionId: number): Promise<Collection> {
    const knex = getKnex();
    const baseQuery = knex.queryBuilder();

    // Use the hierarchy query to get the full nested structure
    this._getCollectionsHierarchyBaseQuery(baseQuery, { include_children: true });

    const query = baseQuery.where('collection.collection_id', collectionId);
    const response = await this.connection.knex(query, Collection);
    return response.rows[0];
  }

  /**
   * Base query for finding collections with filters and permissions (flat only).
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
        subquery.select('collection_id').from('collection_member').where('system_user_id', systemUserId)
      );
    }

    if (filterFields.system_user_id) {
      getCollectionIdsQuery.whereIn('collection.collection_id', (subquery) =>
        subquery.select('collection_id').from('collection_member').where('system_user_id', filterFields.system_user_id)
      );
    }

    const query = knex.queryBuilder();
    this._getCollectionsFlatQuery(query);

    if (filterFields.parent_collection_id != null) {
      query.where('collection.parent_collection_id', filterFields.parent_collection_id);
    } else {
      query.whereNull('collection.parent_collection_id');
    }

    query.whereIn('collection.collection_id', getCollectionIdsQuery);

    return query;
  }

  async findCollections(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ICollectionAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<Collection[]> {
    const knex = getKnex();

    const query = filterFields.include_children
      ? this._getCollectionsHierarchyBaseQuery(knex.queryBuilder(), filterFields)
      : this._makeFindCollectionsBaseQuery(isUserAdmin, systemUserId, filterFields);

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
