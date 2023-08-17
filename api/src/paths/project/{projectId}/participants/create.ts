import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_IDENTITY_SOURCE } from '../../../../constants/database';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/http-error';
import { IParticipant } from '../../../../repositories/project-participation-repository';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ProjectParticipationService } from '../../../../services/project-participation-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/participants/create');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectPermission'
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
                required: ['userIdentifier', 'identitySource', 'displayName', 'email', 'roleId'],
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
                  displayName: {
                    type: 'string',
                    description: 'The display name for the user.'
                  },
                  email: {
                    type: 'string',
                    description: 'The email for the user.'
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
    const projectId = Number(req.params.projectId);

    if (!projectId) {
      throw new HTTP400('Missing required param `projectId`');
    }

    if (!req.body.participants || !req.body.participants.length) {
      throw new HTTP400('Missing required body param `participants`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const participants: IParticipant[] = req.body.participants;

      await connection.open();
      const projectParticipationService = new ProjectParticipationService(connection);

      const promises: Promise<any>[] = participants.map((participant) => {
        return projectParticipationService.ensureSystemUserAndProjectParticipantUser(projectId, {
          ...participant,
          userGuid: null
        });
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
