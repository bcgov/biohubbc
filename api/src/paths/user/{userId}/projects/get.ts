import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ProjectParticipationService } from '../../../../services/project-participation-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/projects/get');
export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getAllUserProjects()
];

GET.apiDoc = {
  description: 'Gets a list of projects based on user Id.',
  tags: ['projects'],
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
      description: 'Projects response object for given user.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'Project Get Response Object',
              type: 'object',
              additionalProperties: false,
              required: [
                'project_participation_id',
                'project_id',
                'project_name',
                'system_user_id',
                'project_role_ids',
                'project_role_names',
                'project_role_permissions'
              ],
              properties: {
                project_participation_id: {
                  type: 'number'
                },
                project_id: {
                  type: 'integer',
                  minimum: 1
                },
                project_name: {
                  type: 'string'
                },
                system_user_id: {
                  type: 'integer',
                  minimum: 1
                },
                project_role_ids: {
                  type: 'array',
                  items: {
                    type: 'integer',
                    minimum: 1
                  }
                },
                project_role_names: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                },
                project_role_permissions: {
                  type: 'array',
                  items: {
                    type: 'string'
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
      $ref: '#/components/responses/403'
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
 * Get all projects (potentially based on filter criteria).
 *
 * @returns {RequestHandler}
 */
export function getAllUserProjects(): RequestHandler {
  return async (req, res) => {
    if (!req.params) {
      throw new HTTP400('Missing required params');
    }

    if (!req.params.userId) {
      throw new HTTP400('Missing required param: userId');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const userId = Number(req.params.userId);

      await connection.open();

      const projectParticipationService = new ProjectParticipationService(connection);

      const getUserProjectsListResponse = await projectParticipationService.getProjectsBySystemUserId(userId);

      await connection.commit();

      return res.status(200).json(getUserProjectsListResponse);
    } catch (error) {
      defaultLog.error({ label: 'getAllUserProjects', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
