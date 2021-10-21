import { IDBConnection } from '../../database/db';
import { HTTP500 } from '../../errors/CustomError';
import { ProjectUserObject } from '../../models/user';
import { getProjectParticipationBySystemUserSQL } from '../../queries/project-participation/project-participation-queries';

export const getProjectUserObject = async (
  projectId: number,
  connection: IDBConnection
): Promise<ProjectUserObject> => {
  let projectUserWithRoles;

  try {
    projectUserWithRoles = await getProjectUserWithRoles(projectId, connection);
  } catch {
    throw new HTTP500('failed to get project user');
  }

  if (!projectUserWithRoles) {
    throw new HTTP500('project user was null');
  }

  return new ProjectUserObject(projectUserWithRoles);
};

/**
 * Get a user's project roles, for a single project.
 *
 * @param {number} projectId
 * @param {IDBConnection} connection
 * @return {*}  {Promise<string[]>}
 */
export const getProjectUserWithRoles = async function (projectId: number, connection: IDBConnection): Promise<any> {
  const systemUserId = connection.systemUserId();

  if (!systemUserId || !projectId) {
    return null;
  }

  const sqlStatement = getProjectParticipationBySystemUserSQL(projectId, systemUserId);

  if (!sqlStatement) {
    return null;
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    return null;
  }

  return response.rows[0];
};
