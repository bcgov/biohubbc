import { IDBConnection } from '../database/db';
import { HTTP400 } from '../errors/CustomError';
import {
  getProjectParticipationBySystemUserSQL,
  postProjectRolesByRoleNameSQL
} from '../queries/project-participation/project-participation-queries';

/**
 * Gets the project participant, adding them if they do not already exist.
 *
 * @param {number} projectId
 * @param {number} systemUserId
 * @param {string} projectParticipantRole
 * @param {IDBConnection} connection
 * @return {*}  {Promise<void>}
 */
export const ensureProjectParticipant = async (
  projectId: number,
  systemUserId: number,
  projectParticipantRole: string,
  connection: IDBConnection
): Promise<void> => {
  const projectParticipantRecord = await getProjectParticipant(projectId, systemUserId, connection);

  if (projectParticipantRecord) {
    // project participant already exists, do nothing
    return;
  }

  // add new project participant record
  await addProjectParticipant(projectId, systemUserId, projectParticipantRole, connection);
};

/**
 * Get an existing project participant.
 *
 * @param {number} projectId
 * @param {number} systemUserId
 * @param {IDBConnection} connection
 * @return {*}  {Promise<any>}
 */
export const getProjectParticipant = async (
  projectId: number,
  systemUserId: number,
  connection: IDBConnection
): Promise<any> => {
  const sqlStatement = getProjectParticipationBySystemUserSQL(projectId, systemUserId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response) {
    throw new HTTP400('Failed to get project participant');
  }

  return response?.rows?.[0] || null;
};

/**
 * Adds a new project participant.
 *
 * Note: Will fail if the project participant already exists.
 *
 * @param {number} projectId
 * @param {number} systemUserId
 * @param {string} projectParticipantRole
 * @param {IDBConnection} connection
 * @return {*}  {Promise<void>}
 */
export const addProjectParticipant = async (
  projectId: number,
  systemUserId: number,
  projectParticipantRole: string,
  connection: IDBConnection
): Promise<void> => {
  const sqlStatement = postProjectRolesByRoleNameSQL(projectId, systemUserId, projectParticipantRole);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to insert project participant');
  }
};
