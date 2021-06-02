import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { HTTP400 } from '../errors/CustomError';
import { projectIdResponseObject } from '../openapi/schemas/project';
import { getProjectListSQL , getFilteredProjectListSQL } from '../queries/project/project-view-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';
import { ProjectListSearchCriteria} from '../models/project-view';

const defaultLog = getLogger('paths/projects');

export const GET: Operation = [logRequest('paths/projects', 'GET'), getProjectList()];


export const POST: Operation = [getProjectListBySearchFilterCriteria()];

GET.apiDoc = {
  description: 'Get all Projects.',
  tags: ['project'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
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





POST.apiDoc = {
  description: 'Gets a list of projects based on search parameters.',
  tags: ['projects'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'ProjectList search filter criteria object.',
    content: {
      'application/json': {
        schema: {
          properties: {
            column_names: {
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
  responses: {
    200: {
      description: 'Activity get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rows: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      // Don't specify exact object properties, as it will vary, and is not currently enforced anyways
                      // Eventually this could be updated to be a oneOf list, similar to the Post request below.
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get all projects.
 *
 * @returns {RequestHandler}
 */
function getProjectList(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {

      const getProjectListSQLStatement = getProjectListSQL();

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
      project_type: row.project_type,
      permits_list: row.permits_list
    };

    projects.push(project);
  });

  return projects;
}


function getProjectListBySearchFilterCriteria(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'projectList', message: 'getProjectListBySearchFilterCriteria', body: req.body });

    const sanitizedSearchCriteria = new ProjectListSearchCriteria(req.body);

    const connection = getDBConnection(req['keycloak_token']);

    try {


      const sqlStatement = getFilteredProjectListSQL(sanitizedSearchCriteria);

      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      await connection.open();

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      await connection.commit();

      // parse the rows from the response
      const rows = { rows: (response && response.rows) || [] };

      // parse the count from the response
      const count = { count: rows.rows.length && parseInt(rows.rows[0]['total_rows_count']) } || {};

      // build the return object
      const result = { ...rows, ...count };

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getProjectListBySearchFilterCriteria', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
