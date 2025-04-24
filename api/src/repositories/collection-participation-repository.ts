import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { CollectionParticipant, IPostCollectionParticipant } from '../models/collection';
import { SystemUserWithRoles } from '../models/system-user-view';
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
   * Get a collection participant record.
   *
   * @param {number} collectionId
   * @param {number} systemUserId
   * @return {*}  {(Promise<CollectionParticipant | null>)}
   * @memberof CollectionParticipationRepository
   */
  async getCollectionParticipant(
    collectionId: number,
    systemUserId: number
  ): Promise<(CollectionParticipant & SystemUserWithRoles) | null> {
    const sqlStatement = SQL`
      SELECT
        su.system_user_id,
        su.user_identifier,
        su.user_guid,
        su.record_end_date,
        uis.name AS identity_source,
        array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
        array_remove(array_agg(sr.name), NULL) AS role_names,
        su.email,
        su.display_name,
        su.given_name,
        su.family_name,
        su.agency,
        sp.collection_participation_id,
        sp.collection_id,
        sp.collection_role_id,
        sj.name collection_role_name
      FROM
        collection_participation sp
        LEFT JOIN
        collection_role sj
        ON sj.collection_role_id = sp.collection_role_id
      LEFT JOIN "system_user" su
        ON sp.system_user_id = su.system_user_id
      LEFT JOIN
        system_user_role sur
        ON su.system_user_id = sur.system_user_id
      LEFT JOIN
        system_role sr
        ON sur.system_role_id = sr.system_role_id
      LEFT JOIN
        user_identity_source uis
        ON uis.user_identity_source_id = su.user_identity_source_id
      WHERE
        sp.collection_id = ${collectionId}
      AND
        sp.system_user_id = ${systemUserId}
      GROUP BY
        su.system_user_id,
        su.record_end_date,
        su.user_identifier,
        su.user_guid,
        uis.name,
        su.email,
        su.display_name,
        su.given_name,
        su.family_name,
        su.agency,
        sp.collection_participation_id,
        sp.collection_role_id,
        sp.collection_id,
        sj.name,
        sp.create_date
      ORDER BY
        sp.create_date DESC;
      `;

    const response = await this.connection.sql(sqlStatement, CollectionParticipant.merge(SystemUserWithRoles));

    return response.rows?.[0] || null;
  }

  /**
   * Get collection participant records.
   *
   * @param {number} collectionId
   * @return {*}  {Promise<CollectionParticipant[]>}
   * @memberof CollectionParticipationRepository
   */
  async getCollectionParticipants(collectionId: number): Promise<(CollectionParticipant & SystemUserWithRoles)[]> {
    const sqlStatement = SQL`
      SELECT
        su.system_user_id,
        su.user_identifier,
        su.user_guid,
        su.record_end_date,
        uis.name AS identity_source,
        array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
        array_remove(array_agg(sr.name), NULL) AS role_names,
        su.email,
        su.display_name,
        su.given_name,
        su.family_name,
        su.agency,
        sp.collection_participation_id,
        sp.collection_id,
        sp.collection_role_id,
        sj.name collection_role_name
      FROM
        collection_participation sp
      LEFT JOIN
        collection_role sj
        ON sj.collection_role_id = sp.collection_role_id
      LEFT JOIN "system_user" su
        ON sp.system_user_id = su.system_user_id
      LEFT JOIN
        system_user_role sur
        ON su.system_user_id = sur.system_user_id
      LEFT JOIN
        system_role sr
        ON sur.system_role_id = sr.system_role_id
      LEFT JOIN
        user_identity_source uis
        ON uis.user_identity_source_id = su.user_identity_source_id
      WHERE
        sp.collection_id = ${collectionId}
      AND
        su.record_end_date is NULL
      GROUP BY
        su.system_user_id,
        su.record_end_date,
        su.user_identifier,
        su.user_guid,
        uis.name,
        su.email,
        su.display_name,
        su.given_name,
        su.family_name,
        su.agency,
        sp.collection_participation_id,
        sp.collection_role_id,
        sp.collection_id,
        sj.name,
        sp.create_date
      ORDER BY
        sp.create_date DESC;
    `;

    const response = await this.connection.sql(sqlStatement, CollectionParticipant.merge(SystemUserWithRoles));

    return response.rows;
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
