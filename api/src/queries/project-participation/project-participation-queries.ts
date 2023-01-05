import SQL, { SQLStatement } from 'sql-template-strings';

/**
 * SQL query to get all projects from user Id.
 *
 * @param {userId} userId
 * @returns {SQLStatement} sql query object
 */
export const getParticipantsFromAllSystemUsersProjectsSQL = (systemUserId: number): SQLStatement | null => {
  if (!systemUserId) {
    return null;
  }

  return SQL`
    SELECT
      pp.project_participation_id,
      pp.project_id,
      pp.system_user_id,
      pp.project_role_id,
      pr.name project_role_name
    FROM
      project_participation pp
    LEFT JOIN
      project p
    ON
      pp.project_id = p.project_id
    LEFT JOIN
      project_role pr
    ON
      pr.project_role_id = pp.project_role_id
    WHERE
      pp.project_id in (
        SELECT
          p.project_id
        FROM
          project_participation pp
        LEFT JOIN
          project p
        ON
          pp.project_id = p.project_id
        WHERE
          pp.system_user_id = ${systemUserId}
      );
  `;
};

/**
 * SQL query to get all projects from user Id.
 *
 * @param {userId} userId
 * @returns {SQLStatement} sql query object
 */
export const getAllUserProjectsSQL = (userId: number): SQLStatement | null => {
  if (!userId) {
    return null;
  }

  return SQL`
    SELECT
      p.project_id,
      p.name,
      pp.system_user_id,
      pp.project_role_id,
      pp.project_participation_id
    FROM
      project_participation pp
    LEFT JOIN
      project p
    ON
      pp.project_id = p.project_id
    WHERE
      pp.system_user_id = ${userId};
  `;
};
