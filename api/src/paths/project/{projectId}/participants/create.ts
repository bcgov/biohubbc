import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ProjectService } from '../../../../services/project-service';
import { UserService } from '../../../../services/user-service';
import { getLogger } from '../../../../utils/logger';

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
                required: ['userIdentifier', 'identitySource', 'roleId'],
                properties: {
                  userIdentifier: {
                    description: 'A IDIR or BCEID username.',
                    type: 'string'
                  },
                  identitySource: {
                    type: 'string',
                    enum: ['IDIR', 'BCEID']
                  },
                  roleId: {
                    description: 'The id of the project role to assign to the participant.',
                    type: 'number'
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

      const participants: { userIdentifier: string; identitySource: string; roleId: number }[] = req.body.participants;

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
  participant: { userIdentifier: string; identitySource: string; roleId: number },
  connection: IDBConnection
) => {
  const userService = new UserService(connection);

  // Add a system user, unless they already have one
  const systemUserObject = await userService.ensureSystemUser(participant.userIdentifier, participant.identitySource);

  const projectService = new ProjectService(connection);

  // Add project role, unless they already have one
  await projectService.ensureProjectParticipant(projectId, systemUserObject.id, participant.roleId);
};
