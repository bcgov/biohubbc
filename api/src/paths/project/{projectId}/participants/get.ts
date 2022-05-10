import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ProjectService } from '../../../../services/project-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/participants/get');

export const GET: Operation = [
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
        type: 'number'
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
                    user_identifier: {
                      type: 'string'
                    },
                    user_identity_source_id: {
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
