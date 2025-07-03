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
   * Add a 'collection_members' CTE to the given query builder.
   *
   * @param {Knex} knex
   * @param {Knex.QueryBuilder} queryBuilder
   */
  _addCollectionMembersCTE(knex: Knex, queryBuilder: Knex.QueryBuilder): void {
    queryBuilder.with('collection_members', (qb) => {
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
        )) FILTER (WHERE su.system_user_id IS NOT NULL), '[]'::jsonb) AS members`)
      )
        .from('collection_member AS cm')
        .join('collection_role as cr', 'cm.collection_role_id', 'cr.collection_role_id')
        .leftJoin('system_user AS su', 'su.system_user_id', 'cm.system_user_id')
        .leftJoin('user_identity_source AS uis', 'uis.user_identity_source_id', 'su.user_identity_source_id')
        .groupBy('cm.collection_id');
    });
  }

  /**
   * Flat collection structure with members only.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @returns {Knex.QueryBuilder}
   */
  _getCollectionsFlatQuery(queryBuilder: Knex.QueryBuilder): Knex.QueryBuilder {
    const knex = getKnex();

    this._addCollectionMembersCTE(knex, queryBuilder);

    return queryBuilder
      .select(
        'collection.collection_id',
        'collection.name',
        'collection.description',
        'collection.parent_collection_id',
        knex.raw(`'[]'::jsonb AS subcollections`),
        knex.raw("COALESCE(cm.members, '[]'::jsonb) AS members")
      )
      .from('collection')
      .leftJoin('collection_members AS cm', 'cm.collection_id', 'collection.collection_id');
  }

  /**
   * Get the base query for retrieving collections with nested subcollections and members.
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

    const query = queryBuilder
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

        // This is the part you want
        if (parentId) {
          base.where('c.collection_id', parentId); // Start recursion here
        } else {
          base.whereNull('c.parent_collection_id');
        }

        return base.unionAll(function () {
          this.select('c.collection_id', 'c.name', 'c.description', 'c.parent_collection_id')
            .from('collection AS c')
            .join('collection_hierarchy AS ch', 'c.parent_collection_id', 'ch.collection_id');
        });
      });

    this._addCollectionMembersCTE(knex, query);

    query
      .with('collection_with_subcollections', (qb) => {
        qb.select(
          'ch.collection_id',
          'ch.name',
          'ch.description',
          'ch.parent_collection_id',
          knex.raw(`COALESCE(cm.members, '[]'::jsonb) AS members`),
          knex.raw("'[]'::jsonb AS subcollections")
        )
          .from('collection_hierarchy AS ch')
          .leftJoin('collection_members AS cm', 'cm.collection_id', 'ch.collection_id');
      })

      .with('final_collection_structure', (qb) => {
        qb.select(
          'c.collection_id',
          'c.name',
          'c.description',
          'c.parent_collection_id',
          'c.members',
          knex.raw(`
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'collection_id', child.collection_id,
              'name', child.name,
              'description', child.description,
              'parent_collection_id', child.parent_collection_id,
              'members', child.members,
              'subcollections', child.subcollections
            )
          ) FILTER (WHERE child.collection_id IS NOT NULL),
          '[]'::jsonb
        ) AS subcollections
      `)
        )
          .from('collection_with_subcollections AS c')
          .leftJoin('collection_with_subcollections AS child', 'child.parent_collection_id', 'c.collection_id')
          .groupBy('c.collection_id', 'c.name', 'c.description', 'c.parent_collection_id', 'c.members');
      })

      .select(
        'collection.collection_id',
        'collection.name',
        'collection.description',
        'collection.parent_collection_id',
        'collection.members',
        'collection.subcollections'
      )
      .from('final_collection_structure AS collection')
      // // This where statement removes subcollections so the response is hierarchical. We cannot just do
      // // .whereNull(collection_parent_id) because a collection might technically be a subcollection (with a parent) but
      // // be a root collection from a user's perspective, because the user doesn't have access to the true parent.
      // // In that case, we want that subcollection at the root of the tree, and to exclude the
      // // subcollection's parent from the response.
      // .where(function () {
      //   this.whereNotExists(function () {
      //     this.select('*')
      //       .from('final_collection_structure AS visible')
      //       .whereRaw('visible.collection_id = collection.parent_collection_id');
      //   }).orWhereNull('collection.parent_collection_id');
      // })
      .orderBy('collection.collection_id');

    return query;
  }

  /**
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number} collectionId
   * @returns {Knex.QueryBuilder}
   */
  _getCollectionsParentsBaseQuery(queryBuilder: Knex.QueryBuilder, collectionId: number): Knex.QueryBuilder {
    const knex = getKnex();

    this._addCollectionMembersCTE(knex, queryBuilder);

    return queryBuilder
      .withRecursive('parent_chain', (qb) => {
        const base = qb
          .select('c.collection_id', 'c.parent_collection_id', knex.raw('0 as depth'))
          .from('collection AS c')
          .where('c.collection_id', collectionId);

        return base.unionAll(function () {
          this.select('p.collection_id', 'p.parent_collection_id', knex.raw('pc.depth + 1 as depth'))
            .from('collection AS p')
            .join('parent_chain AS pc', 'pc.parent_collection_id', 'p.collection_id');
        });
      })

      .with('collection_details', (qb) => {
        qb.select('c.collection_id', 'c.name', 'c.description', 'c.parent_collection_id', 'pc.depth')
          .from('collection AS c')
          .join('parent_chain AS pc', 'pc.collection_id', 'c.collection_id')
          .orderBy('pc.depth', 'desc');
      })

      .with('collection_with_members', (qb) => {
        qb.select(
          'cd.collection_id',
          'cd.name',
          'cd.description',
          'cd.parent_collection_id',
          'cd.depth',
          knex.raw(`
        COALESCE(
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
          )) FILTER (WHERE su.system_user_id IS NOT NULL),
          '[]'::jsonb
        ) AS members
      `)
        )
          .from('collection_details AS cd')
          .leftJoin('collection_member AS cm', 'cm.collection_id', 'cd.collection_id')
          .leftJoin('system_user AS su', 'su.system_user_id', 'cm.system_user_id')
          .leftJoin('collection_role AS cr', 'cr.collection_role_id', 'cm.collection_role_id')
          .leftJoin('user_identity_source AS uis', 'uis.user_identity_source_id', 'su.user_identity_source_id')
          .groupBy('cd.collection_id', 'cd.name', 'cd.description', 'cd.parent_collection_id', 'cd.depth');
      })

      .with('nested_hierarchy', (qb) => {
        qb.select(
          'cwp.collection_id',
          'cwp.name',
          'cwp.description',
          'cwp.parent_collection_id',
          'cwp.members',
          'cwp.depth',
          knex.raw(`'[]'::jsonb AS subcollections`)
        )
          .from('collection_with_members AS cwp')
          .where('cwp.depth', 0)
          .unionAll(function () {
            this.select(
              'cwp.collection_id',
              'cwp.name',
              'cwp.description',
              'cwp.parent_collection_id',
              'cwp.members',
              'cwp.depth',
              knex.raw(`
            jsonb_build_array(
              jsonb_build_object(
                'collection_id', nh.collection_id,
                'name', nh.name,
                'description', nh.description,
                'parent_collection_id', nh.parent_collection_id,
                'members', nh.members,
                'subcollections', nh.subcollections
              )
            ) AS subcollections
          `)
            )
              .from('collection_with_members AS cwp')
              .join('nested_hierarchy AS nh', 'nh.parent_collection_id', 'cwp.collection_id')
              .where('cwp.depth', '>', 0);
          });
      })

      .select(
        'nh.collection_id',
        'nh.name',
        'nh.description',
        'nh.parent_collection_id',
        'nh.members',
        'nh.subcollections'
      )
      .from('nested_hierarchy AS nh')
      .orderBy('nh.depth', 'desc')
      .limit(1);
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

    // Apply visibility filters
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

    // Handle parent_collection_id logic
    if (filterFields.parent_collection_id) {
      getCollectionIdsQuery.where('collection.parent_collection_id', filterFields.parent_collection_id);
    } else {
      // No explicit parent specified: include top-level collections (either no parent or inaccessible parent)
      getCollectionIdsQuery.where(function () {
        this.whereNull('collection.parent_collection_id').orWhereNotIn('collection.parent_collection_id', function () {
          this.select('collection_id').from('collection');
        });
      });
    }

    const query = knex.queryBuilder();

    this._getCollectionsHierarchyBaseQuery(query, filterFields);

    query.whereIn('collection.collection_id', getCollectionIdsQuery);

    return query;
  }

  /**
   * Get a collection by ID, including nested subcollections and members.
   *
   * @param {number} collectionId - The ID of the collection to retrieve.
   * @returns {Promise<Collection>} A promise resolving to the collection.
   * @memberof CollectionRepository
   */
  async getCollectionById(collectionId: number): Promise<Collection> {
    const knex = getKnex();
    const baseQuery = knex.queryBuilder();

    // Use the hierarchy query to get the full nested structure
    this._getCollectionsFlatQuery(baseQuery);

    const query = baseQuery.where('collection.collection_id', collectionId);

    const response = await this.connection.knex(query, Collection);

    if (!response.rowCount || response.rowCount < 1) {
      throw new ApiExecuteSQLError('Failed to get collection by id', [
        'collectionRepository->getCollectionById',
        'rowCount was < 1, expected rowCount >= 1'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Get collections that the given survey belongs to
   *
   * @param {number} surveyId
   * @returns {Promise<Collection[]>}
   * @memberof CollectionRepository
   */
  async getCollectionsBySurveyId(surveyId: number): Promise<Collection[]> {
    const knex = getKnex();
    const baseQuery = knex.queryBuilder();

    // Use the hierarchy query to get the full nested structure
    this._getCollectionsFlatQuery(baseQuery);

    const queryBuilder = baseQuery
      .join('collection_survey as cs', 'cs.collection_id', 'collection.collection_id')
      .where('cs.survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, Collection);

    return response.rows;
  }

  // /**
  //  * Base query for finding collections with filters and permissions (flat only).
  //  *
  //  * @param {boolean} isUserAdmin - Whether the user has admin privileges.
  //  * @param {number | null} systemUserId - The ID of the system user.
  //  * @param {ICollectionAdvancedFilters} filterFields - The fields to filter by.
  //  * @returns {Knex.QueryBuilder} The Knex query builder with filters applied.
  //  * @memberof CollectionRepository
  //  */
  // _makeFindCollectionsBaseQuery(
  //   isUserAdmin: boolean,
  //   systemUserId: number | null,
  //   filterFields: ICollectionAdvancedFilters
  // ): Knex.QueryBuilder {
  //   const knex = getKnex();

  //   const getCollectionIdsQuery = knex.select('collection_id').from('collection');

  //   if (!isUserAdmin) {
  //     getCollectionIdsQuery.whereIn('collection.collection_id', (subquery) =>
  //       subquery.select('collection_id').from('collection_member').where('system_user_id', systemUserId)
  //     );
  //   }

  //   if (filterFields.system_user_id) {
  //     getCollectionIdsQuery.whereIn('collection.collection_id', (subquery) =>
  //       subquery.select('collection_id').from('collection_member').where('system_user_id', filterFields.system_user_id)
  //     );
  //   }

  //   const query = knex.queryBuilder();
  //   this._getCollectionsFlatQuery(query);

  //   query.whereIn('collection.collection_id', getCollectionIdsQuery);

  //   return query;
  // }

  /**
   * Find collections that the user has access to
   *
   * @param isUserAdmin
   * @param systemUserId
   * @param filterFields
   * @param pagination
   * @returns
   */
  async findCollections(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ICollectionAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<Collection[]> {
    const query = this._findCollectionsBaseQuery(isUserAdmin, systemUserId, filterFields);

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
   * Get the parents of the given collection
   *
   * @param {number} collectionId - The collectionId for the new collection.
   * @returns {Promise<Collection>}
   * @memberof CollectionRepository
   */
  async getCollectionParentsById(collectionId: number): Promise<Collection> {
    const query = getKnex().queryBuilder();
    this._getCollectionsParentsBaseQuery(query, collectionId);

    const response = await this.connection.knex(query, Collection);

    if (!response.rowCount || response.rowCount < 1) {
      throw new ApiExecuteSQLError('Failed to get collection parents', [
        'collectionRepository->getCollectionParents',
        'rowCount was < 1, expected rowCount >= 1'
      ]);
    }

    return response.rows[0];
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
    SET 
      name = ${data.name}, 
      description = ${data.description}
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
   * Remove the parent collection from a collection.
   *
   * @param {number[]} collectionIds - The ID of the collection to update.
   * @returns {Promise<void>}
   * @memberof CollectionRepository
   */
  async deleteCollectionParents(collectionIds: number[]): Promise<void> {
    const sql = SQL`
    UPDATE collection
    SET 
      parent_collection_id = NULL
    WHERE collection_id IN (${collectionIds})
    RETURNING *;
  `;

    await this.connection.sql(sql, CollectionModel);
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
    const baseQuery = this._findCollectionsBaseQuery(isUserAdmin, systemUserId, filterFields);
    const countQuery = knex.from(baseQuery.as('sub')).select(knex.raw('count(*)::integer as count'));

    const response = await this.connection.knex(countQuery, z.object({ count: z.number() }));
    return response.rows[0].count;
  }

  /**
   * Delete a collection by ID.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<boolean>}
   * @memberof CollectionRepository
   */
  async deleteCollection(collectionId: number): Promise<boolean> {
    const sql = SQL`
      DELETE FROM collection
      WHERE collection_id = ${collectionId};
    `;

    const response = await this.connection.sql(sql);

    return response.rowCount !== null && response.rowCount > 0;
  }

  /**
   * Delete collections
   *
   * @param {number[]} collectionIds
   * @returns {Promise<void>}
   * @memberof CollectionSurveyRepository
   */
  async deleteCollections(collectionIds: number[]): Promise<void> {
    const sql = SQL`
      WITH w_remove_parent AS (  
        UPDATE collection
        SET parent_collection_id = NULL
        WHERE collection_id = ANY (${collectionIds})
      ),
      w_remove_surveys AS (
        DELETE FROM collection_survey
        WHERE collection_id = ANY (${collectionIds})
      ),
      w_remove_members AS (
        DELETE FROM collection_member
        WHERE collection_id = ANY (${collectionIds})
      )
      DELETE FROM collection
      WHERE collection_id = ANY (${collectionIds});
    `;

    await this.connection.sql(sql);
  }
}
