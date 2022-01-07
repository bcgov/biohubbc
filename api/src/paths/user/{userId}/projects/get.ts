import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { queries } from '../../../../queries/queries';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/projects/get');
export const GET: Operation = [getAllUserProjects()];

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
              properties: {
                project_id: {
                  type: 'number'
                },
                name: {
                  type: 'string'
                },
                system_user_id: {
                  type: 'number'
                },
                project_role_id: {
                  type: 'number'
                },
                project_participation_id: {
                  type: 'number'
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

      const getAllUserProjectsSQLStatement = queries.projectParticipation.getAllUserProjectsSQL(userId);

      if (!getAllUserProjectsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      const getUserProjectsListResponse = await connection.query(
        getAllUserProjectsSQLStatement.text,
        getAllUserProjectsSQLStatement.values
      );

      await connection.commit();

      let rows: any[] = [];

      if (getUserProjectsListResponse && getUserProjectsListResponse.rows) {
        rows = getUserProjectsListResponse.rows;
      }

      const result: any[] = _extractUserProjects(rows);

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getAllUserProjects', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Extract an array of project data from DB query.
 *
 * @export
 * @param {any[]} rows DB query result rows
 * @return {any[]} An array of project data
 */
export function _extractUserProjects(rows: any[]): any[] {
  if (!rows || !rows.length) {
    return [];
  }

  const projects: any[] = [];

  rows.forEach((row) => {
    const project: any = {
      project_id: row.project_id,
      name: row.name,
      system_user_id: row.system_user_id,
      project_role_id: row.project_role_id,
      project_participation_id: row.project_participation_id
    };

    projects.push(project);
  });

  return projects;
}
