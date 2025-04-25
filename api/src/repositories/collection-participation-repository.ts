import { Knex } from 'knex';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import {
  CollectionParticipant,
  ICollectionParticipantsAdvancedFilters,
  IPostCollectionParticipant
} from '../models/collection';
import { SystemUserWithRoles } from '../models/system-user-view';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';

/**
 * A repository class for accessing collection participants data.
 *
 * @export
 * @class CollectionParticipationRepository
 * @extends {BaseRepository}
 */
export class CollectionParticipationRepository extends BaseRepository {
  /**
   * Get a single collection participant record with user and role info.
   *
   * @param {number} collectionId - The ID of the collection.
   * @param {number} systemUserId - The system user ID.
   * @returns {Promise<(CollectionParticipant & SystemUserWithRoles) | null>}
   */
  async getCollectionParticipant(
    collectionId: number,
    systemUserId: number
  ): Promise<(CollectionParticipant & SystemUserWithRoles) | null> {
    const knex = getKnex();

    const query = knex
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
        'sp.collection_participation_id',
        'sp.collection_id',
        'sp.collection_role_id',
        'sj.name as collection_role_name'
      ])
      .from('collection_participation as sp')
      .leftJoin('collection_role as sj', 'sj.collection_role_id', 'sp.collection_role_id')
      .leftJoin('system_user as su', 'sp.system_user_id', 'su.system_user_id')
      .leftJoin('system_user_role as sur', 'su.system_user_id', 'sur.system_user_id')
      .leftJoin('system_role as sr', 'sur.system_role_id', 'sr.system_role_id')
      .leftJoin('user_identity_source as uis', 'uis.user_identity_source_id', 'su.user_identity_source_id')
      .where('sp.collection_id', collectionId)
      .andWhere('sp.system_user_id', systemUserId)
      .groupBy([
        'su.system_user_id',
        'su.record_end_date',
        'su.user_identifier',
        'su.user_guid',
        'uis.name',
        'su.email',
        'su.display_name',
        'su.given_name',
        'su.family_name',
        'su.agency',
        'sp.collection_participation_id',
        'sp.collection_role_id',
        'sp.collection_id',
        'sj.name',
        'sp.create_date'
      ])
      .orderBy('sp.create_date', 'desc');

    const result = await query;

    return result?.[0] || null;
  }

  /**
   * Create a base query for retrieving collection participants.
   *
   * @param {number} collectionId - The ID of the collection.
   * @param {Knex} knex - Knex instance.
   * @returns {Knex.QueryBuilder} Knex query builder with joins and aggregations.
   */
  _makeCollectionParticipantsBaseQuery(collectionId: number, knex: Knex): Knex.QueryBuilder {
    return knex('collection_participation as sp')
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
        'sp.collection_participation_id',
        'sp.collection_id',
        'sp.collection_role_id',
        'sj.name as collection_role_name'
      ])
      .leftJoin('collection_role as sj', 'sj.collection_role_id', 'sp.collection_role_id')
      .leftJoin('system_user as su', 'sp.system_user_id', 'su.system_user_id')
      .leftJoin('system_user_role as sur', 'su.system_user_id', 'sur.system_user_id')
      .leftJoin('system_role as sr', 'sur.system_role_id', 'sr.system_role_id')
      .leftJoin('user_identity_source as uis', 'uis.user_identity_source_id', 'su.user_identity_source_id')
      .where('sp.collection_id', collectionId)
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
        'sp.collection_participation_id',
        'sp.collection_role_id',
        'sp.collection_id',
        'sj.name',
        'sp.create_date'
      ])
      .orderBy('sp.create_date', 'desc');
  }

  /**
   * Get collection participant records.
   *
   * @param {number} collectionId
   * @param {ApiPaginationOptions} pagination
   * @return {*}  {Promise<CollectionParticipant[]>}
   * @memberof CollectionParticipationRepository
   */
  /**
   * Get collection participant records.
   *
   * @param {number} collectionId - The collection ID.
   * @param {ICollectionParticipantsAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination] - Optional pagination.
   * @returns {Promise<(CollectionParticipant & SystemUserWithRoles)[]>}
   */
  async getCollectionParticipants(
    collectionId: number,
    filterFields?: ICollectionParticipantsAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<(CollectionParticipant & SystemUserWithRoles)[]> {
    const knex = getKnex();
    const query = this._makeCollectionParticipantsBaseQuery(collectionId, knex);

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    if (filterFields?.system_user_id) {
      query.whereIn('collection.collection_participation', (subquery) =>
        subquery
          .select('collection_participation')
          .from('collceton_participation')
          .where('system_user_id', filterFields?.system_user_id)
      );
    }

    const response = await this.connection.knex(query, CollectionParticipant.merge(SystemUserWithRoles));

    return response.rows;
  }

  /**
   * Returns the total number of participants in the given collection
   *
   * @param {number} collectionId
   * @return {*}  {Promise<number>}
   * @memberof SurveyService
   */
  async getCollectionParticipantsCount(collectionId: number): Promise<number> {
    const sqlStatement = SQL`
        SELECT
          COUNT(*)::integer AS count
        FROM
          collection_participation
        WHERE
          collection_id = ${collectionId};
      `;

    const response = await this.connection.sql(sqlStatement, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get collection_participation count', [
        'collectionParticipationRepository->getCollectionParticipantsCount',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Insert a collection participant record.
   *
   * @param {number} collectionId
   * @param {IPostCollectionParticipant} values
   * @return {*}  {Promise<void>}
   * @memberof CollectionParticipationRepository
   */
  async insertCollectionParticipant(collectionId: number, values: IPostCollectionParticipant): Promise<void> {
    const sqlStatement = SQL`
      INSERT INTO collection_participation (
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
      throw new ApiExecuteSQLError('Failed to insert collection participant', [
        'CollectionParticipationRepository->insertCollectionParticipant',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * Update a collection participant record.
   *
   * @param {number} collectionId
   * @param {number} collectionParticipationId
   * @param {string} collectionRoleName
   * @return {*}  {Promise<void>}
   * @memberof CollectionParticipationRepository
   */
  async updateCollectionParticipantRole(
    collectionId: number,
    collectionParticipationId: number,
    collectionRoleName: string
  ): Promise<void> {
    const sqlStatement = SQL`
      UPDATE collection_participation
      SET
        collection_role_id = (SELECT collection_role_id FROM collection_role WHERE name = ${collectionRoleName} LIMIT 1)
      WHERE
        collection_participation_id = ${collectionParticipationId}
      AND
        collection_id = ${collectionId}
      ;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to update collection participant', [
        'CollectionParticipationRepository->updateCollectionParticipant',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }
  /**
   * Delete a collection participation record.
   *
   * @param {number} collectionId
   * @param {number} collectionParticipationId
   * @return {*}  {Promise<any>}
   * @memberof CollectionParticipationRepository
   */
  async deleteCollectionParticipationRecord(collectionId: number, collectionParticipationId: number): Promise<any> {
    const sqlStatement = SQL`
      DELETE FROM
        collection_participation
      WHERE
        collection_participation_id = ${collectionParticipationId}
      AND
        collection_id = ${collectionId}
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete collection participation record', [
        'CollectionParticipationRepository->deleteCollectionParticipationRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }
}
