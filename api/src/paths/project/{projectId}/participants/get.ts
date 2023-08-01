import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ProjectService } from '../../../../services/project-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/participants/get');

export const GET: Operation = [
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
  getParticipants()
];

GET.apiDoc = {
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
  responses: {
    200: {
      description: 'List of project participants.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              participants: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    project_participation_id: {
                      type: 'number'
                    },
                    project_id: {
                      type: 'number'
                    },
                    system_user_id: {
                      type: 'number'
                    },
                    project_role_id: {
                      type: 'number'
                    },
                    project_role_name: {
                      type: 'string'
                    },
                    user_guid: {
                      type: 'string',
                      description: 'The GUID for the user.',
                      nullable: true
                    },
                    user_identifier: {
                      type: 'string'
                    },
                    user_identity_source_id: {
                      type: 'number'
                    },
                    user_identity_source_name: {
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

/**
 * Get all project participants.
 *
 * @returns {RequestHandler}
 */
export function getParticipants(): RequestHandler {
  return async (req, res) => {
    if (!req.params.projectId) {
      throw new HTTP400('Missing required param `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params.projectId);

      await connection.open();

      const projectService = new ProjectService(connection);

      const result = await projectService.getProjectParticipants(projectId);

      await connection.commit();

      return res.status(200).json({ participants: result });
    } catch (error) {
      defaultLog.error({ label: 'getAllProjectParticipantsSQL', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
