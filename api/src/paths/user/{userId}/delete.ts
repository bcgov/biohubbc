import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import { queries } from '../../../queries/queries';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { UserService } from '../../../services/user-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/delete');

export const DELETE: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  removeSystemUser()
];

DELETE.apiDoc = {
  description: 'Remove a user from the system.',
  tags: ['user'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'userId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Remove system user from system OK.'
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/401'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function removeSystemUser(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'removeSystemUser', message: 'params', req_params: req.params });

    const userId = (req.params && Number(req.params.userId)) || null;

    if (!userId) {
      throw new HTTP400('Missing required path param: userId');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      await checkIfUserIsOnlyProjectLeadOnAnyProject(userId, connection);

      const userService = new UserService(connection);

      const usrObject = await userService.getUserById(userId);

      if (!usrObject) {
        throw new HTTP400('Failed to get system user');
      }

      if (usrObject.record_end_date) {
        throw new HTTP400('The system user is not active');
      }

      await deleteAllProjectRoles(userId, connection);

      await userService.deleteUserSystemRoles(userId);

      await userService.deactivateSystemUser(userId);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'removeSystemUser', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const checkIfUserIsOnlyProjectLeadOnAnyProject = async (userId: number, connection: IDBConnection) => {
  const getAllParticipantsResponse = await getAllParticipantsFromSystemUsersProjects(userId, connection);

  // No projects associated to user, skip Project Lead role check
  if (!getAllParticipantsResponse.length) {
    return;
  }

  const onlyProjectLeadResponse = doAllProjectsHaveAProjectLeadIfUserIsRemoved(getAllParticipantsResponse, userId);

  if (!onlyProjectLeadResponse) {
    throw new HTTP400('Cannot remove user. User is the only Project Lead for one or more projects.');
  }
};

export const deleteAllProjectRoles = async (userId: number, connection: IDBConnection) => {
  const sqlStatement = queries.users.deleteAllProjectRolesSQL(userId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL delete statement for deleting project roles');
  }

  connection.query(sqlStatement.text, sqlStatement.values);
};

/**
 * collect all participants associated with user across all projects.
 *
 * @param {number} userId
 * @param {IDBConnection} connection
 * @return {*}  {Promise<any[]>}
 */
export const getAllParticipantsFromSystemUsersProjects = async (
  userId: number,
  connection: IDBConnection
): Promise<any[]> => {
  const getParticipantsFromAllSystemUsersProjectsSQLStatment = queries.projectParticipation.getParticipantsFromAllSystemUsersProjectsSQL(
    userId
  );

  if (!getParticipantsFromAllSystemUsersProjectsSQLStatment) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(
    getParticipantsFromAllSystemUsersProjectsSQLStatment.text,
    getParticipantsFromAllSystemUsersProjectsSQLStatment.values
  );

  return response.rows || [];
};

/**
 * Given an array of project participation role objects, return false if any project has no Project Lead role. Return
 * true otherwise.
 *
 * @param {any[]} rows
 * @return {*}  {boolean}
 */
export const doAllProjectsHaveAProjectLead = (rows: any[]): boolean => {
  // No project with project lead
  if (!rows.length) {
    return false;
  }

  const projectLeadsPerProject: { [key: string]: any } = {};

  // count how many Project Lead roles there are per project
  rows.forEach((row) => {
    const key = row.project_id;

    if (!projectLeadsPerProject[key]) {
      projectLeadsPerProject[key] = 0;
    }

    if (row.project_role_name === PROJECT_ROLE.PROJECT_LEAD) {
      projectLeadsPerProject[key] += 1;
    }
  });

  const projectLeadCounts = Object.values(projectLeadsPerProject);

  // check if any projects would be left with no Project Lead
  for (const count of projectLeadCounts) {
    if (!count) {
      // found a project with no Project Lead
      return false;
    }
  }

  // all projects have a Project Lead
  return true;
};

/**
 * Given an array of project participation role objects, return true if any project has no Project Lead role after
 * removing all rows associated with the provided `userId`. Return false otherwise.
 *
 * @param {any[]} rows
 * @param {number} userId
 * @return {*}  {boolean}
 */
export const doAllProjectsHaveAProjectLeadIfUserIsRemoved = (rows: any[], userId: number): boolean => {
  // No project with project lead
  if (!rows.length) {
    return false;
  }

  const projectLeadsPerProject: { [key: string]: any } = {};

  // count how many Project Lead roles there are per project
  rows.forEach((row) => {
    const key = row.project_id;

    if (!projectLeadsPerProject[key]) {
      projectLeadsPerProject[key] = 0;
    }

    if (row.system_user_id !== userId && row.project_role_name === PROJECT_ROLE.PROJECT_LEAD) {
      projectLeadsPerProject[key] += 1;
    }
  });

  const projectLeadCounts = Object.values(projectLeadsPerProject);

  // check if any projects would be left with no Project Lead
  for (const count of projectLeadCounts) {
    if (!count) {
      // found a project with no Project Lead
      return false;
    }
  }

  // all projects have a Project Lead
  return true;
};
