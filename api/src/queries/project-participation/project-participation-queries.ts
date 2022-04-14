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

  const sqlStatement: SQLStatement = SQL`
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

  return sqlStatement;
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

  const sqlStatement: SQLStatement = SQL`
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

  return sqlStatement;
};

/**
 * SQL query to add a single project role to a user.
 *
 * @param {number} projectId
 * @param {number} systemUserId
 * @param {string} projectParticipantRole
 * @return {*}  {(SQLStatement | null)}
 */
export const getProjectParticipationBySystemUserSQL = (
  projectId: number,
  systemUserId: number
): SQLStatement | null => {
  if (!projectId || !systemUserId) {
    return null;
  }

  const sqlStatement = SQL`
  SELECT
    pp.project_id,
    pp.system_user_id,
    su.record_end_date,
    array_remove(array_agg(pr.project_role_id), NULL) AS project_role_ids,
    array_remove(array_agg(pr.name), NULL) AS project_role_names
  FROM
    project_participation pp
  LEFT JOIN
    project_role pr
  ON
    pp.project_role_id = pr.project_role_id
  LEFT JOIN
    system_user su
  ON
    pp.system_user_id = su.system_user_id
  WHERE
    pp.project_id = ${projectId}
  AND
    pp.system_user_id = ${systemUserId}
  AND
    su.record_end_date is NULL
  GROUP BY
    pp.project_id,
    pp.system_user_id,
    su.record_end_date ;
  `;

  return sqlStatement;
};

/**
 * SQL query to get all project participants.
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const getAllProjectParticipantsSQL = (projectId: number): SQLStatement | null => {
  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      pp.project_participation_id,
      pp.project_id,
      pp.system_user_id,
      pp.project_role_id,
      pr.name project_role_name,
      su.user_identifier,
      su.user_identity_source_id
    FROM
      project_participation pp
    LEFT JOIN
      system_user su
    ON
      pp.system_user_id = su.system_user_id
    LEFT JOIN
      project_role pr
    ON
      pr.project_role_id = pp.project_role_id
    WHERE
      pp.project_id = ${projectId};
  `;

  return sqlStatement;
};

/**
 * SQL query to add a single project role to a user.
 *
 * @param {number} projectId
 * @param {number} systemUserId
 * @param {string} projectParticipantRole
 * @return {*}  {(SQLStatement | null)}
 */
export const addProjectRoleByRoleNameSQL = (
  projectId: number,
  systemUserId: number,
  projectParticipantRole: string
): SQLStatement | null => {
  if (!projectId || !systemUserId || !projectParticipantRole) {
    return null;
  }

  const sqlStatement = SQL`
    INSERT INTO project_participation (
      project_id,
      system_user_id,
      project_role_id
    )
    (
      SELECT
        ${projectId},
        ${systemUserId},
        project_role_id
      FROM
        project_role
      WHERE
        name = ${projectParticipantRole}
    )
    RETURNING
      *;
  `;

  return sqlStatement;
};

/**
 * SQL query to add a single project role to a user.
 *
 * @param {number} projectId
 * @param {number} systemUserId
 * @param {string} projectParticipantRole
 * @return {*}  {(SQLStatement | null)}
 */
export const addProjectRoleByRoleIdSQL = (
  projectId: number,
  systemUserId: number,
  projectParticipantRoleId: number
): SQLStatement | null => {
  if (!projectId || !systemUserId || !projectParticipantRoleId) {
    return null;
  }

  const sqlStatement = SQL`
    INSERT INTO project_participation (
      project_id,
      system_user_id,
      project_role_id
    ) VALUES (
      ${projectId},
      ${systemUserId},
      ${projectParticipantRoleId}
    )
    RETURNING
      *;
  `;

  return sqlStatement;
};

/**
 * SQL query to delete a single project participation record.
 *
 * @param {number} projectParticipationId
 * @return {*}  {(SQLStatement | null)}
 */
export const deleteProjectParticipationSQL = (projectParticipationId: number): SQLStatement | null => {
  if (!projectParticipationId) {
    return null;
  }

  const sqlStatement = SQL`
    DELETE FROM
      project_participation
    WHERE
      project_participation_id = ${projectParticipationId}
    RETURNING
      *;
  `;

  return sqlStatement;
};
