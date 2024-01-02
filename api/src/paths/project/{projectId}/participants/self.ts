import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/http-error';
import { ProjectParticipationService } from '../../../../services/project-participation-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/participants/self');

export const GET: Operation = [getSelf()];

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
      description: 'Project participant roles.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            nullable: true,
            required: [
              'project_participation_id',
              'project_id',
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
 * Get all project participant roles.
 *
 * @returns {RequestHandler}
 */
export function getSelf(): RequestHandler {
  return async (req, res) => {
    if (!req.params.projectId) {
      throw new HTTP400("Missing required param 'projectId'");
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params.projectId);

      await connection.open();

      const systemUserId = connection.systemUserId();
      if (!systemUserId) {
        throw new HTTP400("Failed to get the user's system user ID");
      }

      const projectParticipationService = new ProjectParticipationService(connection);

      const result = await projectParticipationService.getProjectParticipant(projectId, systemUserId);

      await connection.commit();

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getAllProjectParticipantsSQL', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
