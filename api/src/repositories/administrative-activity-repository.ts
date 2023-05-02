import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { ADMINISTRATIVE_ACTIVITY_STATUS_TYPE } from '../paths/administrative-activities';
import { BaseRepository } from './base-repository';

export interface IAdministrativeActivityStanding {
  has_pending_acccess_request: boolean;
  has_one_or_more_project_roles: boolean;
}

export interface IAdministrativeActivity {
  id: number;
  type: number;
  type_name: string;
  status: number;
  status_name: string;
  description: string | null;
  data: string | object; // JSON data blob containing additional information about the activity record
  notes: string | null,
  create_date: Date
}

export interface ICreateAdministrativeActivity {
  id: number;
  date: Date;
}

/**
 * A repository class for accessing permit data.
 *
 * @export
 * @class PermitRepository
 * @extends {BaseRepository}
 */
export class AdministrativeActivityRepository extends BaseRepository {
  /**
   * SQL query to get a list of administrative activities.
   *
   * @param {string[]} [administrativeActivityTypeNames]
   * @param {string[]} [administrativeActivityStatusTypes]
   * @returns {SQLStatement} sql query object
   */
  async getAdministrativeActivities (
    administrativeActivityTypeNames?: string[],
    administrativeActivityStatusTypes?: string[]
  ): Promise<IAdministrativeActivity[]> {
    const sqlStatement = SQL`
      SELECT
        aa.administrative_activity_id as id,
        aat.administrative_activity_type_id as type,
        aat.name as type_name,
        aast.administrative_activity_status_type_id as status,
        aast.name as status_name,
        aa.description,
        aa.data,
        aa.notes,
        aa.create_date
      FROM
        administrative_activity aa
      LEFT OUTER JOIN
        administrative_activity_status_type aast
      ON
        aa.administrative_activity_status_type_id = aast.administrative_activity_status_type_id
      LEFT OUTER JOIN
        administrative_activity_type aat
      ON
        aa.administrative_activity_type_id = aat.administrative_activity_type_id
      WHERE
        1 = 1
    `; // @TODO where 1=1???

    if (administrativeActivityTypeNames?.length) {
      sqlStatement.append(SQL`
        AND
          aat.name IN (
      `);

      // Add first element
      sqlStatement.append(SQL`${administrativeActivityTypeNames[0]}`);

      for (let idx = 1; idx < administrativeActivityTypeNames.length; idx++) {
        // Add subsequent elements, which get a comma prefix
        sqlStatement.append(SQL`, ${administrativeActivityTypeNames[idx]}`);
      }

      sqlStatement.append(SQL`)`);
    }

    if (administrativeActivityStatusTypes?.length) {
      sqlStatement.append(SQL`
        AND
          aast.name IN (
      `);

      // Add first element
      sqlStatement.append(SQL`${administrativeActivityStatusTypes[0]}`);

      for (let idx = 1; idx < administrativeActivityStatusTypes.length; idx++) {
        // Add subsequent elements, which get a comma prefix
        sqlStatement.append(SQL`, ${administrativeActivityStatusTypes[idx]}`);
      }

      sqlStatement.append(SQL`)`);
    }

    sqlStatement.append(`;`);

    const response = await this.connection.sql<IAdministrativeActivity>(sqlStatement);
    return response.rows;
  }

  /**
   * SQL query to insert a row in the administrative_activity table.
   *
   * @param {number} systemUserId the ID of the user in context
   * @param {string | object} data JSON data blob
   * @return {*}  {(SQLStatement | null)}
   */
  async postAdministrativeActivity(systemUserId: number, data: string | object): Promise<ICreateAdministrativeActivity> {
    const sqlStatement = SQL`
      INSERT INTO administrative_activity (
        reported_system_user_id,
        administrative_activity_type_id,
        administrative_activity_status_type_id,
        data
      ) VALUES (
        ${systemUserId},
        1,
        1,
        ${data}
      )
      RETURNING
        administrative_activity_id AS id,
        create_date::timestamptz AS date
    `;

    const response = await this.connection.sql<ICreateAdministrativeActivity>(sqlStatement);

    if (!response.rows.length) {
      throw new ApiExecuteSQLError('Failed to create administrative activity record', [
        'AdministrativeActivityRepository->postAdministrativeActivity'
      ]);
    }

    return response.rows[0];
  }

  /**
   * SQL query to count pending records in the administrative_activity table.
   *
   * @param {number} systemUserId the ID of the user in context
   * @return {*}  {(SQLStatement | null)}
   */
  async getAdministrativeActivityStanding(userIdentifier: string): Promise<IAdministrativeActivityStanding> {
    const sqlStatement = SQL`
      WITH
        administrative_activity_with_status
      AS (
        SELECT
          CASE
            WHEN COUNT(*) > 0 THEN TRUE
            ELSE FALSE
          END AS has_pending_acccess_request
        FROM
          administrative_activity aa
        LEFT OUTER JOIN
          administrative_activity_status_type aast
        ON
          aa.administrative_activity_status_type_id = aast.administrative_activity_status_type_id
        WHERE
          (aa.data -> 'username')::text =  '"' || ${userIdentifier} || '"'
        AND
          aast.name = 'Pending'
      ),
        system_user_project_roles
      AS (
        SELECT
          CASE
            WHEN COUNT(*) > 0 THEN TRUE
            ELSE FALSE
          END AS has_one_or_more_project_roles
        FROM
          project_participation pp
        LEFT JOIN
          system_user su 
        ON
          pp.system_user_id = su.system_user_id 
        WHERE
          su.user_identifier = ${userIdentifier}
      ) SELECT
        *
      FROM
        administrative_activity_with_status,
        system_user_project_roles;
    `;

    const response = await this.connection.sql<IAdministrativeActivityStanding>(sqlStatement);

    return response.rows[0];
  }

  /**
   * SQL query to update an existing administrative activity record.
   *
   * @param {number} administrativeActivityId
   * @param {ADMINISTRATIVE_ACTIVITY_STATUS_TYPE} administrativeActivityStatusTypeName
   * @return {*}  {(SQLStatement | null)}
   */
  async putAdministrativeActivity(
    administrativeActivityId: number,
    administrativeActivityStatusTypeName: ADMINISTRATIVE_ACTIVITY_STATUS_TYPE
  ): Promise<{ id: number }> {
    const sqlStatement = SQL`
      UPDATE
        administrative_activity
      SET
        administrative_activity_status_type_id = (
          SELECT
            administrative_activity_status_type_id
          FROM
            administrative_activity_status_type
          WHERE
            name = ${administrativeActivityStatusTypeName}
        )
      WHERE
        administrative_activity_id = ${administrativeActivityId}
      RETURNING
        administrative_activity_id
      AS
        id;
    `;

    const response = await this.connection.sql<{ id: number }>(sqlStatement);

    return response.rows[0];
  }
}
