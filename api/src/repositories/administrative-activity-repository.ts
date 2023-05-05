import SQL from 'sql-template-strings';
import {
  ADMINISTRATIVE_ACTIVITY_STATUS_TYPE,
  ADMINISTRATIVE_ACTIVITY_TYPE
} from '../constants/administrative-activity';
import { ApiExecuteSQLError } from '../errors/api-error';
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
  notes: string | null;
  create_date: Date | string;
}

export interface ICreateAdministrativeActivity {
  id: number;
  date: Date;
}

/**
 * A repository class for accessing administrative activity data.
 *
 * @export
 * @class AdministrativeActivityRepository
 * @extends {BaseRepository}
 */
export class AdministrativeActivityRepository extends BaseRepository {
  /**
   * SQL query to get a list of administrative activities.
   *
   * @param {string[]} [administrativeActivityTypeNames]
   * @param {string[]} [administrativeActivityStatusTypes]
   * @return {*}  {Promise<IAdministrativeActivity[]>}
   * @memberof AdministrativeActivityRepository
   */
  async getAdministrativeActivities(
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
    `;

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
   * Inserts a row in the administrative_activity table reflecting a pending access request.
   *
   * @param {number} systemUserId
   * @param {(string | object)} data
   * @return {*}  {Promise<ICreateAdministrativeActivity>}
   * @memberof AdministrativeActivityRepository
   */
  async createPendingAccessRequest(
    systemUserId: number,
    data: string | object
  ): Promise<ICreateAdministrativeActivity> {
    const sqlStatement = SQL`
      INSERT INTO administrative_activity (
        reported_system_user_id,
        administrative_activity_type_id,
        administrative_activity_status_type_id,
        data
      ) VALUES (
        ${systemUserId},
        (
          SELECT
            aat.administrative_activity_type_id
          FROM
            administrative_activity_type aat
          WHERE
            aat.name = ${ADMINISTRATIVE_ACTIVITY_TYPE.SYSTEM_ACCESS}
        ),
        (
          SELECT
            aast.administrative_activity_status_type_id
          FROM
            administrative_activity_status_type aast
          WHERE
            aast.name = 'Pending'
        ),
        ${data}
      )
      RETURNING
        administrative_activity_id AS id,
        create_date::timestamptz AS date
    `;

    const response = await this.connection.sql<ICreateAdministrativeActivity>(sqlStatement);

    if (!response.rows.length) {
      throw new ApiExecuteSQLError('Failed to create administrative activity record', [
        'AdministrativeActivityRepository->createPendingAccessRequest'
      ]);
    }

    return response.rows[0];
  }

  /**
   * SQL query to count pending records in the administrative_activity table.
   *
   * @param {string} userIdentifier
   * @return {*}  {(Promise<IAdministrativeActivityStanding>)}
   * @memberof AdministrativeActivityRepository
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
   * @return {*}  {Promise<void>}
   * @memberof AdministrativeActivityRepository
   */
  async putAdministrativeActivity(
    administrativeActivityId: number,
    administrativeActivityStatusTypeName: ADMINISTRATIVE_ACTIVITY_STATUS_TYPE
  ): Promise<void> {
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
        administrative_activity_id = ${administrativeActivityId};
    `;

    const response = await this.connection.sql<{ administrative_activity_id: number }>(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update administrative activity record', [
        'AdministrativeActivityRepository->putAdministrativeActivity'
      ]);
    }
  }
}
