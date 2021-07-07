import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import moment from 'moment';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { HTTP400 } from '../errors/CustomError';
import { projectIdResponseObject } from '../openapi/schemas/project';
import { getProjectListSQL } from '../queries/project/project-view-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/projects');

export const POST: Operation = [logRequest('paths/projects', 'POST'), getProjectList()];

POST.apiDoc = {
  description: 'Gets a list of projects based on search parameters if passed in.',
  tags: ['projects'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'Project list search filter criteria object.',
    content: {
      'application/json': {
        schema: {
          properties: {
            coordinator_agency: {
              type: 'string',
              nullable: true
            },
            permit_number: {
              type: 'string',
              nullable: true
            },
            project_type: {
              type: 'string',
              nullable: true
            },
            start_date: {
              type: 'string',
              nullable: true
            },
            end_date: {
              type: 'string',
              nullable: true
            },
            keyword: {
              type: 'string',
              nullable: true
            },
            project_name: {
              type: 'string',
              nullable: true
            },
            regions: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            agency_id: {
              anyOf: [
                {
                  type: 'number'
                },
                {
                  type: 'string',
                  maxLength: 0
                }
              ],
              nullable: true
            },
            agency_project_id: {
              type: 'string',
              nullable: true
            },
            species: {
              type: 'array',
              items: {
                type: 'number'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Project response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              ...(projectIdResponseObject as object)
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
function getProjectList(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const filterFields = req.body || null;

    try {
      const getProjectListSQLStatement = getProjectListSQL(filterFields);

      if (!getProjectListSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const getProjectListResponse = await connection.query(
        getProjectListSQLStatement.text,
        getProjectListSQLStatement.values
      );

      await connection.commit();

      let rows: any[] = [];

      if (getProjectListResponse && getProjectListResponse.rows) {
        rows = getProjectListResponse.rows;
      }

      const result: any[] = _extractProjects(rows);

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getProjectList', message: 'error', error });
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
export function _extractProjects(rows: any[]): any[] {
  if (!rows || !rows.length) {
    return [];
  }

  const projects: any[] = [];

  rows.forEach((row) => {
    const project: any = {
      id: row.id,
      name: row.name,
      start_date: row.start_date,
      end_date: row.end_date,
      coordinator_agency: row.coordinator_agency_name,
      publish_status: row.publish_timestamp ? 'Published' : 'Unpublished',
      completion_status:
        (row.end_date && moment(row.end_date).endOf('day').isBefore(moment()) && 'Completed') || 'Active',
      project_type: row.project_type,
      permits_list: row.permits_list
    };

    projects.push(project);
  });

  return projects;
}
