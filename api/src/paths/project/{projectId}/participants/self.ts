import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/http-error';
import { ProjectUserObject } from '../../../../models/user';
import { ProjectService } from '../../../../services/project-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/participants/self');

export const GET: Operation = [
  getUserRoles()
];

GET.apiDoc = {
  description: "Get the user's participant record for the given project.",
  tags: ['project', 'participant'],
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
      description: 'Project particpant roles.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              participant: {
                type: 'object',
                nullable: true,
                properties: {
                  project_id: {
                    type: 'integer',
                    minimum: 1
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
 * Get all project participant roles.
 *
 * @returns {RequestHandler}
 */
export function getUserRoles(): RequestHandler {
  return async (req, res) => {
    if (!req.params.projectId) {
      throw new HTTP400('Missing required param `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params.projectId);

      await connection.open();

      const systemUserId = connection.systemUserId();
      if (!systemUserId) {
        throw new HTTP400("Failed to get the user's system user ID");
      }

      const projectService = new ProjectService(connection);
      const result = await projectService.getProjectParticipant(projectId, systemUserId);

      await connection.commit();

      // await new Promise(r => setTimeout(r, 5000));

      return res.status(200).json({
        participant: result ? new ProjectUserObject(result) : null
      });

    } catch (error) {
      defaultLog.error({ label: 'getAllProjectParticipantsSQL', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
