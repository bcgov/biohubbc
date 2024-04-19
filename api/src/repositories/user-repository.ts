import SQL from 'sql-template-strings';
import { z } from 'zod';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export const SystemUser = z.object({
  system_user_id: z.number(),
  user_identifier: z.string(),
  user_guid: z.string().nullable(),
  identity_source: z.string(),
  record_end_date: z.string().nullable(),
  role_ids: z.array(z.number()),
  role_names: z.array(z.string()),
  email: z.string(),
  display_name: z.string(),
  given_name: z.string().nullable(),
  family_name: z.string().nullable(),
  agency: z.string().nullable()
});

export type SystemUser = z.infer<typeof SystemUser>;

export interface IInsertUser {
  system_user_id: number;
  user_identity_source_id: number;
  user_identifier: number;
  record_effective_date: string;
  record_end_date: string;
}

export interface IGetRoles {
  system_role_id: number;
  name: string;
}

export interface UserSearchCriteria {
  keyword?: 'string';
}

export class UserRepository extends BaseRepository {
  /**
   * Get all system roles in db
   *
   * @return {*}  {Promise<IGetRoles[]>}
   * @memberof UserRepository
   */
  async getRoles(): Promise<IGetRoles[]> {
    const sqlStatement = SQL`
    SELECT
      sr.system_role_id,
      sr.name
    FROM
      system_role sr
    `;

    const response = await this.connection.sql<IGetRoles>(sqlStatement);

    return response.rows;
  }

  /**
   * Fetch a single system user by their system user ID.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<SystemUser>}
   * @memberof UserRepository
   */
  async getUserById(systemUserId: number): Promise<SystemUser> {
    const sqlStatement = SQL`
    SELECT
      su.system_user_id,
      su.user_identifier,
      su.user_guid,
      su.record_end_date,
      uis.name AS identity_source,
      COALESCE(array_remove(array_agg(sr.system_role_id), NULL), '{}') AS role_ids,
      COALESCE(array_remove(array_agg(sr.name), NULL), '{}') AS role_names,
      su.email,
      su.display_name,
      su.given_name,
      su.family_name,
      su.agency
    FROM
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.system_user_id = sur.system_user_id
    LEFT JOIN
      system_role sr
    ON
      sur.system_role_id = sr.system_role_id
    LEFT JOIN
      user_identity_source uis
    ON
      uis.user_identity_source_id = su.user_identity_source_id
    WHERE
      su.system_user_id = ${systemUserId}
    AND
      su.record_end_date IS NULL
    GROUP BY
      su.system_user_id,
      uis.name,
      su.user_guid,
      su.record_end_date,
      su.user_identifier,
      su.email,
      su.display_name,
      su.given_name,
      su.family_name,
      su.agency;
  `;

    const response = await this.connection.sql(sqlStatement, SystemUser);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get user by id', [
        'UserRepository->getUserById',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }
    return response.rows[0];
  }

  /**
   * Get an existing system user by their GUID.
   *
   * @param {string} userGuid the user's GUID
   * @return {*}  {Promise<SystemUser>}
   * @memberof UserRepository
   */
  async getUserByGuid(userGuid: string): Promise<SystemUser[]> {
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
      su.agency
    FROM
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.system_user_id = sur.system_user_id
    LEFT JOIN
      system_role sr
    ON
      sur.system_role_id = sr.system_role_id
    LEFT JOIN
      user_identity_source uis
    ON
      uis.user_identity_source_id = su.user_identity_source_id
    WHERE
      LOWER(su.user_guid) = LOWER(${userGuid})
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
      su.agency;
  `;

    const response = await this.connection.sql(sqlStatement, SystemUser);

    return response.rows;
  }

  /**
   * Get an existing system user by their user identifier and identity source.
   *
   * @param userIdentifier the user's identifier
   * @param identitySource the user's identity source, e.g. `'IDIR'`
   * @return {*} {(Promise<SystemUser[]>)} Promise resolving an array containing the user, if they match the
   * search criteria.
   * @memberof UserService
   */
  async getUserByIdentifier(userIdentifier: string, identitySource: string): Promise<SystemUser[]> {
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
        su.agency
      FROM
        system_user su
      LEFT JOIN
        system_user_role sur
      ON
        su.system_user_id = sur.system_user_id
      LEFT JOIN
        system_role sr
      ON
        sur.system_role_id = sr.system_role_id
      LEFT JOIN
        user_identity_source uis
      ON
        uis.user_identity_source_id = su.user_identity_source_id
      WHERE
        LOWER(su.user_identifier) = ${userIdentifier.toLowerCase()}
      AND
        uis.name = ${identitySource.toUpperCase()}
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
        su.agency;
    `;

    const response = await this.connection.sql(sqlStatement, SystemUser);

    return response.rows;
  }

  /**
   * Adds a new system user.
   *
   * Note: Will fail if the system user already exists.
   *
   * @param {string | null} userGuid
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @param {string} displayName
   * @param {string} email
   * @return {*}  {Promise<{ system_user_id: number }>}
   * @memberof UserRepository
   */
  async addSystemUser(
    userGuid: string | null,
    userIdentifier: string,
    identitySource: string,
    displayName: string,
    email: string,
    givenName?: string,
    familyName?: string
  ): Promise<{ system_user_id: number }> {
    const sqlStatement = SQL`
    INSERT INTO
      system_user
    (
      user_guid,
      user_identity_source_id,
      user_identifier,
      display_name,
      given_name,
      family_name,
      email,
      record_effective_date
    )
    VALUES (
      ${userGuid ? userGuid.toLowerCase() : null},
      (
        SELECT
          user_identity_source_id
        FROM
          user_identity_source
        WHERE
          name = ${identitySource.toUpperCase()}
      ),
      ${userIdentifier},
      ${displayName},
      ${givenName || null},
      ${familyName || null},
      ${email.toLowerCase()},
      now()
    )
    RETURNING
      system_user_id;
  `;
    const newUserResponse = await this.connection.sql<{ system_user_id: number }>(sqlStatement);
    if (newUserResponse.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert new user', [
        'UserRepository->addSystemUser',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }

    return newUserResponse.rows[0];
  }

  /**
   * Get a list of all system users.
   *
   * @return {*}  {Promise<SystemUser[]>}
   * @memberof UserRepository
   */
  async listSystemUsers(): Promise<SystemUser[]> {
    const sqlStatement = SQL`
    SELECT
      su.system_user_id,
      su.user_guid,
      su.user_identifier,
      su.record_end_date,
      uis.name AS identity_source,
      array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
      array_remove(array_agg(sr.name), NULL) AS role_names,
      su.email,
      su.display_name,
      su.given_name,
      su.family_name,
      su.agency
    FROM
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.system_user_id = sur.system_user_id
    LEFT JOIN
      system_role sr
    ON
      sur.system_role_id = sr.system_role_id
    LEFT JOIN
      user_identity_source uis
    ON
      su.user_identity_source_id = uis.user_identity_source_id
    WHERE
      su.record_end_date IS NULL AND uis.name not in (${SYSTEM_IDENTITY_SOURCE.DATABASE})
    GROUP BY
      su.system_user_id,
      su.user_guid,
      su.record_end_date,
      su.user_identifier,
      uis.name,
      su.email,
      su.display_name,
      su.given_name,
      su.family_name,
      su.agency;
  `;
    const response = await this.connection.sql(sqlStatement, SystemUser);

    return response.rows;
  }

  /**
   * Activates an existing system user that had been deactivated (soft deleted).
   *
   * @param {number} systemUserId
   * @memberof UserRepository
   */
  async activateSystemUser(systemUserId: number) {
    const sqlStatement = SQL`
      UPDATE
        system_user
      SET
        record_end_date = NULL
      WHERE
        system_user_id = ${systemUserId}
      RETURNING
        system_user_id,
        user_identity_source_id,
        user_identifier,
        record_effective_date,
        record_end_date;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to activate system user', [
        'UserRepository->activateSystemUser',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }
  }

  /**
   * Deactivates an existing system user (soft delete).
   *
   * @param {number} systemUserId
   * @memberof UserRepository
   */
  async deactivateSystemUser(systemUserId: number) {
    const sqlStatement = SQL`
      UPDATE
        system_user
      SET
        record_end_date = now()
      WHERE
        system_user_id = ${systemUserId}
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to deactivate system user', [
        'UserRepository->deactivateSystemUser',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }
  }

  /**
   * Delete all system roles for the user.
   *
   * @param {number} systemUserId
   * @memberof UserRepository
   */
  async deleteUserSystemRoles(systemUserId: number) {
    const sqlStatement = SQL`
      DELETE FROM
        system_user_role
      WHERE
        system_user_id = ${systemUserId}
      RETURNING
        *;
    `;

    await this.connection.sql(sqlStatement);
  }

  /**
   * Adds the specified roleIds to the user.
   *
   * @param {number} systemUserId
   * @param {number[]} roleIds
   * @memberof UserRepository
   */
  async addUserSystemRoles(systemUserId: number, roleIds: number[]) {
    const sqlStatement = SQL`
    INSERT INTO system_user_role (
      system_user_id,
      system_role_id
    ) VALUES `;

    roleIds.forEach((roleId, index) => {
      sqlStatement.append(SQL`
      (${systemUserId},${roleId})
    `);

      if (index !== roleIds.length - 1) {
        sqlStatement.append(',');
      }
    });

    sqlStatement.append(';');

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert user system roles', [
        'UserRepository->addUserSystemRoles',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }
  }

  /**
   * Adds the specified roles by name to the user.
   *
   * @param {number} systemUserId
   * @param {string} roleName
   * @memberof UserRepository
   */
  async addUserSystemRoleByName(systemUserId: number, roleName: string) {
    const sqlStatement = SQL`
    INSERT INTO system_user_role (
      system_user_id,
      system_role_id
    ) VALUES (
      ${systemUserId},
      (SELECT system_role_id FROM system_role WHERE name = ${roleName})
    );
  `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert user system roles', [
        'UserRepository->addUserSystemRoleByName',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }
  }

  async deleteAllProjectRoles(systemUserId: number) {
    const sqlStatement = SQL`
      DELETE FROM
        project_participation
      WHERE
        system_user_id = ${systemUserId}
      RETURNING
        *;
    `;

    return this.connection.sql(sqlStatement);
  }

  /**
   * Get an array of users based on search criteria.
   *
   * @param {UserSearchCriteria} searchCriteria
   * @return {*}  {Promise<SystemUser[]>}
   * @memberof UserRepository
   */
  async getUsers(searchCriteria: UserSearchCriteria): Promise<SystemUser[]> {
    const knex = getKnex();
    const queryBuilder = knex.queryBuilder();

    queryBuilder
      .select(
        'su.system_user_id',
        'su.user_guid',
        'su.user_identifier',
        'su.record_end_date',
        'uis.name AS identity_source',
        knex.raw('array_remove(array_agg(sr.system_role_id), NULL) AS role_ids'),
        knex.raw('array_remove(array_agg(sr.name), NULL) AS role_names'),
        'su.email',
        'su.display_name',
        'su.given_name',
        'su.family_name',
        'su.agency'
      )
      .from('system_user AS su')
      .leftJoin('system_user_role AS sur', 'su.system_user_id', 'sur.system_user_id')
      .leftJoin('system_role AS sr', 'sur.system_role_id', 'sr.system_role_id')
      .leftJoin('user_identity_source AS uis', 'su.user_identity_source_id', 'uis.user_identity_source_id');

    if (searchCriteria.keyword) {
      const keywords = searchCriteria.keyword.split(' ');

      queryBuilder.orWhere((qb) => {
        keywords.forEach((keyword) => {
          // Add where clauses to each space delimited string from the keyword string
          qb.orWhereRaw(`LOWER(su.email) LIKE LOWER('%${keyword}%')`);
          qb.orWhereRaw(`LOWER(su.display_name) LIKE LOWER('%${keyword}%')`);
          qb.orWhereRaw(`LOWER(su.agency) LIKE LOWER('%${keyword}%')`);

          // Order by to sort the matches based on most important match to least important
          // Not as powerful as elastic search, but will at least prioritize email matches over agency matches, for example.
          qb.orderByRaw(knex.raw(`LOWER(su.email) LIKE LOWER('%${keyword}%') OR NULL`));
          qb.orderByRaw(knex.raw(`LOWER(su.display_name) LIKE LOWER('%${keyword}%') OR NULL`));
          qb.orderByRaw(knex.raw(`LOWER(su.agency) LIKE LOWER('%${keyword}%') OR NULL`));
        });
      });
    }

    queryBuilder.andWhere('su.record_end_date', null);
    queryBuilder.whereNotIn('uis.name', [SYSTEM_IDENTITY_SOURCE.DATABASE]);

    queryBuilder.groupBy('su.system_user_id');
    queryBuilder.groupBy('uis.name');
    queryBuilder.groupBy('su.user_guid');
    queryBuilder.groupBy('su.record_end_date');
    queryBuilder.groupBy('su.user_identifier');
    queryBuilder.groupBy('su.email');
    queryBuilder.groupBy('su.display_name');
    queryBuilder.groupBy('su.given_name');
    queryBuilder.groupBy('su.family_name');
    queryBuilder.groupBy('su.agency');

    queryBuilder.limit(50);

    const response = await this.connection.knex(queryBuilder, SystemUser);

    return response.rows;
  }
}
