import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../database/db';
import { HTTP400, HTTP500 } from '../../../../errors/CustomError';
import { UserObject } from '../../../../models/user';
import {
  getProjectParticipationBySystemUserSQL,
  postProjectRolesByRoleNameSQL
} from '../../../../queries/project-participation/project-participation-queries';
import { activateSystemUserSQL, getUserByUserIdentifierSQL } from '../../../../queries/users/user-queries';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../utils/logger';
import { addSystemUser } from '../../../user';

const defaultLog = getLogger('paths/project/{projectId}/participants/create');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  createProjectParticipants()
];

POST.apiDoc = {
  description: 'Get all project participants.',
  tags: ['project'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['participants'],
          properties: {
            participants: {
              type: 'array',
              items: {
                type: 'object',
                required: ['userIdentifier', 'identitySource', 'role'],
                properties: {
                  userIdentifier: {
                    description: 'A IDIR or BCEID username.',
                    type: 'string'
                  },
                  identitySource: {
                    type: 'string',
                    enum: ['IDIR', 'BCEID']
                  },
                  role: {
                    description: 'The name of the project role to assign to the participant.',
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Project participants added OK.'
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

export function createProjectParticipants(): RequestHandler {
  return async (req, res) => {
    if (!req.params.projectId) {
      throw new HTTP400('Missing required param `projectId`');
    }

    if (!req.body.participants || !req.body.participants.length) {
      throw new HTTP400('Missing required body param `participants`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params.projectId);
      const participants: { userIdentifier: string; identitySource: string; role: string }[] = req.body.participants;

      await connection.open();

      const promises: Promise<any>[] = [];

      participants.forEach((participant) =>
        promises.push(ensureSystemUserAndProjectParticipantUser(projectId, participant, connection))
      );

      await Promise.all(promises);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'insertProjectParticipants', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const ensureSystemUserAndProjectParticipantUser = async (
  projectId: number,
  participant: { userIdentifier: string; identitySource: string; role: string },
  connection: IDBConnection
) => {
  // Add a system user, unless they already have one
  const systemUserObject = await ensureSystemUser(participant.userIdentifier, participant.identitySource, connection);

  // Add project role, unless they already have one
  await ensureProjectParticipant(projectId, systemUserObject.id, participant.role, connection);
};

export const ensureSystemUser = async (
  userIdentifier: string,
  identitySource: string,
  connection: IDBConnection
): Promise<UserObject> => {
  // Check if the user exists in SIMS
  let systemUserRecord = await getSystemUser(userIdentifier, connection);

  if (!systemUserRecord) {
    // Id of the current authenticated user
    const systemUserId = connection.systemUserId();

    if (!systemUserId) {
      throw new HTTP400('Failed to identify system user ID');
    }

    // Found no existing user, add them
    systemUserRecord = await addSystemUser(userIdentifier, identitySource, connection);
  }

  let userObject = new UserObject(systemUserRecord);

  if (!userObject.user_record_end_date) {
    // system user is active
    return userObject;
  }

  // system user is not active
  const response = await activateDeactivatedSystemUser(userObject.id, connection);

  if (!response) {
    throw new HTTP500('Failed to activate system user');
  }

  userObject = new UserObject(systemUserRecord);
  if (!userObject.id || !userObject.user_identifier) {
    throw new HTTP500('Failed to add system user');
  }

  return userObject;
};

export const getSystemUser = async (userIdentifier: string, connection: IDBConnection): Promise<object | null> => {
  const sqlStatement = getUserByUserIdentifierSQL(userIdentifier);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response) {
    throw new HTTP400('Failed to verify system user');
  }

  return response?.rows?.[0] || null;
};

export const activateDeactivatedSystemUser = async (systemUserId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = activateSystemUserSQL(systemUserId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response) {
    throw new HTTP400('Failed to activate system user');
  }

  return response?.rows?.[0] || null;
};

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

  if (!response || !response?.rows?.length) {
    throw new HTTP400('Failed to insert project participant');
  }
};
