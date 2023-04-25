import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_IDENTITY_SOURCE } from '../../../../constants/database';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ProjectService } from '../../../../services/project-service';
import { UserService } from '../../../../services/user-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/participants/create');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
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
        type: 'integer',
        minimum: 1
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
                    enum: [
                      SYSTEM_IDENTITY_SOURCE.IDIR,
                      SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
                      SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS
                    ]
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

type Participant = { userIdentifier: string; identitySource: string; roleId: number };

export function createProjectParticipants(): RequestHandler {
  return async (req, res) => {
    const projectId = Number(req.params.projectId);

    if (!projectId) {
      throw new HTTP400('Missing required param `projectId`');
    }

    if (!req.body.participants || !req.body.participants.length) {
      throw new HTTP400('Missing required body param `participants`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const participants: Participant[] = req.body.participants;

      await connection.open();

      const promises: Promise<any>[] = participants.map((participant) => {
        return ensureSystemUserAndProjectParticipantUser(projectId, { ...participant, userGuid: null }, connection);
      });

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
  participant: Participant & { userGuid: string | null },
  connection: IDBConnection
) => {
  const userService = new UserService(connection);

  // Create or activate the system user
  const systemUserObject = await userService.ensureSystemUser(
    participant.userGuid,
    participant.userIdentifier,
    participant.identitySource
  );

  const projectService = new ProjectService(connection);

  // Add project role, unless they already have one
  await projectService.ensureProjectParticipant(projectId, systemUserObject.id, participant.roleId);
};
