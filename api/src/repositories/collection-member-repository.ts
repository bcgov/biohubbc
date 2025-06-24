import { Knex } from 'knex';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { CollectionMember, ICollectionMembersAdvancedFilters, IPostCollectionMember } from '../models/collection';
import { SystemUserWithRoles } from '../models/system-user-view';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';

/**
 * A repository class for accessing collection members data.
 *
 * @export
 * @class CollectionMemberRepository
 * @extends {BaseRepository}
 */
export class CollectionMemberRepository extends BaseRepository {
  /**
   * Create a query to retrieve members of a collection and all its parent collections recursively.
   *
   * @param {number} collectionId - The starting collection ID.
   * @param {Knex} knex - Knex instance.
   * @returns {Knex.QueryBuilder} The knex query builder.
   */
  _makeCollectionMembersBaseQuery(collectionId: number, knex: Knex): Knex.QueryBuilder {
    const recursiveCTE = knex.withRecursive('collection_hierarchy', (qb) => {
      qb.select('collection_id', 'parent_collection_id')
        .from('collection')
        .where('collection_id', collectionId)
        .unionAll((qb2) => {
          qb2
            .select('c.collection_id', 'c.parent_collection_id')
            .from('collection as c')
            .join('collection_hierarchy as ch', 'c.collection_id', 'ch.parent_collection_id');
        });
    });

    return recursiveCTE
      .select([
        'su.system_user_id',
        'su.user_identifier',
        'su.user_guid',
        'su.record_end_date',
        'uis.name as identity_source',
        knex.raw('array_remove(array_agg(sr.system_role_id), NULL) as role_ids'),
        knex.raw('array_remove(array_agg(sr.name), NULL) as role_names'),
        'su.email',
        'su.display_name',
        'su.given_name',
        'su.family_name',
        'su.agency',
        'cp.collection_member_id',
        'cp.collection_id',
        'cp.collection_role_id',
        'cr.name as collection_role_name'
      ])
      .from('collection_member as cp')
      .leftJoin('collection_role as cr', 'cr.collection_role_id', 'cp.collection_role_id')
      .leftJoin('system_user as su', 'cp.system_user_id', 'su.system_user_id')
      .leftJoin('system_user_role as sur', 'su.system_user_id', 'sur.system_user_id')
      .leftJoin('system_role as sr', 'sur.system_role_id', 'sr.system_role_id')
      .leftJoin('user_identity_source as uis', 'uis.user_identity_source_id', 'su.user_identity_source_id')
      .join('collection_hierarchy as ch', 'cp.collection_id', 'ch.collection_id')
      .whereNull('su.record_end_date')
      .groupBy([
        'su.system_user_id',
        'su.user_identifier',
        'su.user_guid',
        'su.record_end_date',
        'uis.name',
        'su.email',
        'su.display_name',
        'su.given_name',
        'su.family_name',
        'su.agency',
        'cp.collection_member_id',
        'cp.collection_role_id',
        'cp.collection_id',
        'cr.name'
      ])
      .orderBy('cp.collection_role_id', 'asc');
  }

  /**
   * Recursive query for getting the collection member record for any parent of the given collection
   *
   * @param {number} collectionId - The ID of the collection.
   * @param {Knex} knex - Knex instance.
   * @returns {Knex.QueryBuilder} Knex query builder with joins and aggregations.
   */
  _makeParentCollectionMembersBaseQuery(collectionId: number, knex: Knex): Knex.QueryBuilder {
    // TODO: Optimize this query
    const recursiveCTE = knex.withRecursive('ancestor_collections', (qb) => {
      qb.select('collection_id')
        .from('collection')
        .where('collection_id', collectionId)
        .unionAll(function () {
          this.select('c.parent_collection_id')
            .from('collection as c')
            .join('ancestor_collections as ac', 'c.collection_id', 'ac.collection_id')
            .whereNotNull('c.parent_collection_id');
        });
    });

    return recursiveCTE
      .select([
        'su.system_user_id',
        'su.user_identifier',
        'su.user_guid',
        'su.record_end_date',
        'uis.name as identity_source',
        knex.raw('array_agg(DISTINCT sr.system_role_id) filter (where sr.system_role_id is not null) as role_ids'),
        knex.raw('array_agg(DISTINCT sr.name) filter (where sr.name is not null) as role_names'),
        'su.email',
        'su.display_name',
        'su.given_name',
        'su.family_name',
        'su.agency',
        'cp.collection_member_id',
        'cp.collection_id',
        'cp.collection_role_id',
        'cr.name as collection_role_name'
      ])
      .from('collection_member as cp')
      .join('ancestor_collections as ac', 'cp.collection_id', 'ac.collection_id')
      .leftJoin('collection_role as cr', 'cr.collection_role_id', 'cp.collection_role_id')
      .leftJoin('system_user as su', 'cp.system_user_id', 'su.system_user_id')
      .leftJoin('system_user_role as sur', 'su.system_user_id', 'sur.system_user_id')
      .leftJoin('system_role as sr', 'sur.system_role_id', 'sr.system_role_id')
      .leftJoin('user_identity_source as uis', 'uis.user_identity_source_id', 'su.user_identity_source_id')
      .whereNull('su.record_end_date')
      .groupBy([
        'su.system_user_id',
        'su.user_identifier',
        'su.user_guid',
        'su.record_end_date',
        'uis.name',
        'su.email',
        'su.display_name',
        'su.given_name',
        'su.family_name',
        'su.agency',
        'cp.collection_member_id',
        'cp.collection_role_id',
        'cp.collection_id',
        'cr.name',
        'cp.create_date'
      ])
      .orderBy('cp.collection_role_id', 'asc');
  }

  /**
   * Get collection member records.
   *
   * @param {number} collectionId - The collection ID.
   * @param {ICollectionMembersAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination] - Optional pagination.
   * @returns {Promise<(CollectionMember & SystemUserWithRoles)[]>}
   */
  async getCollectionMembers(
    collectionId: number,
    filterFields?: ICollectionMembersAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<(CollectionMember & SystemUserWithRoles)[]> {
    const knex = getKnex();
    const query = this._makeCollectionMembersBaseQuery(collectionId, knex);

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    if (filterFields?.system_user_id) {
      query.whereIn('cp.collection_member_id', (subquery) =>
        subquery
          .select('collection_member_id')
          .from('collection_member')
          .where('system_user_id', filterFields.system_user_id)
      );
    }

    const response = await this.connection.knex(query, CollectionMember.merge(SystemUserWithRoles));

    return response.rows;
  }

  /**
   * Returns the total number of members in the given collection
   *
   * @param {number} collectionId
   * @return {*}  {Promise<number>}
   * @memberof SurveyService
   */
  async getCollectionMembersCount(collectionId: number): Promise<number> {
    const sqlStatement = SQL`
        SELECT
          COUNT(*)::integer AS count
        FROM
          collection_member
        WHERE
          collection_id = ${collectionId};
      `;

    const response = await this.connection.sql(sqlStatement, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get collection_member count', [
        'CollectionMemberRepository->getCollectionMembersCount',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Insert a collection member record.
   *
   * @param {number} collectionId
   * @param {IPostCollectionMember} values
   * @return {*}  {Promise<void>}
   * @memberof CollectionMemberRepository
   */
  async insertCollectionMember(collectionId: number, values: IPostCollectionMember): Promise<void> {
    const sqlStatement = SQL`
      INSERT INTO collection_member (
        collection_id,
        system_user_id,
        collection_role_id
      ) VALUES (
        ${collectionId},
        ${values.system_user_id},
        (SELECT collection_role_id FROM collection_role WHERE name = ${values.collection_role_name})
      );
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert collection member', [
        'CollectionMemberRepository->insertCollectionMember',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * Update a collection member record.
   *
   * @param {number} collectionId
   * @param {number} CollectionMemberId
   * @param {string} collectionRoleName
   * @return {*}  {Promise<void>}
   * @memberof CollectionMemberRepository
   */
  async updateCollectionMemberRole(
    collectionId: number,
    CollectionMemberId: number,
    collectionRoleName: string
  ): Promise<void> {
    const sqlStatement = SQL`
      UPDATE collection_member
      SET
        collection_role_id = (SELECT collection_role_id FROM collection_role WHERE name = ${collectionRoleName} LIMIT 1)
      WHERE
        collection_member_id = ${CollectionMemberId}
      AND
        collection_id = ${collectionId}
      ;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to update collection member', [
        'CollectionMemberRepository->updateCollectionMember',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }
  /**
   * Delete a collection participation record.
   *
   * @param {number} collectionId
   * @param {number} CollectionMemberId
   * @return {*}  {Promise<any>}
   * @memberof CollectionMemberRepository
   */
  async deleteCollectionMemberRecord(collectionId: number, CollectionMemberId: number): Promise<any> {
    const sqlStatement = SQL`
      DELETE FROM
        collection_member
      WHERE
        collection_member_id = ${CollectionMemberId}
      AND
        collection_id = ${collectionId}
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete collection participation record', [
        'CollectionMemberRepository->deleteCollectionMemberRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Get a single collection member record with user and role info.
   *
   * @param {number} collectionId - The ID of the collection.
   * @param {number} systemUserId - The system user ID.
   * @returns {Promise<(CollectionMember & SystemUserWithRoles) | null>}
   */
  async getCollectionMemberByCollectionIdAndSystemUserId(
    collectionId: number,
    systemUserId: number
  ): Promise<(CollectionMember & SystemUserWithRoles) | null> {
    const knex = getKnex();

    const query = this._makeCollectionMembersBaseQuery(collectionId, knex).where('su.system_user_id', systemUserId);

    const response = await this.connection.knex(query, CollectionMember.merge(SystemUserWithRoles));

    return response.rows?.[0] || null;
  }

  /**
   * Get a single collection member record with user and role info.
   *
   * @param {number} collectionId - The ID of the collection.
   * @param {string} userGuid - The system user GUID.
   * @returns {Promise<(CollectionMember & SystemUserWithRoles) | null>}
   */
  async getCollectionMemberByCollectionIdAndUserGuid(
    collectionId: number,
    userGuid: string
  ): Promise<(CollectionMember & SystemUserWithRoles) | null> {
    const knex = getKnex();

    const query = this._makeCollectionMembersBaseQuery(collectionId, knex).where('su.user_guid', userGuid);

    const response = await this.connection.knex(query, CollectionMember.merge(SystemUserWithRoles));

    return response.rows?.[0] || null;
  }

  /**
   * Get the collection member record for any parent of the given collection id (recursively walk up the tree)
   *
   * @param {number} collectionId - The ID of the collection.
   * @param {string} userGuid - The system user GUID.
   * @returns {Promise<(CollectionMember & SystemUserWithRoles)[]>}
   */
  async getParentCollectionMemberByCollectionIdAndUserGuid(
    collectionId: number,
    userGuid: string
  ): Promise<(CollectionMember & SystemUserWithRoles)[]> {
    const knex = getKnex();

    const query = this._makeParentCollectionMembersBaseQuery(collectionId, knex).where('su.user_guid', userGuid);

    const response = await this.connection.knex(query, CollectionMember.merge(SystemUserWithRoles));

    return response.rows;
  }
}
