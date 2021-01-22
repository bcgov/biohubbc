import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { QueryResult } from 'pg';
import { READ_ROLES } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { projectResponseBody } from '../openapi/schemas/project';
import { getProjectsSQL } from '../queries/project-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/project');

export const GET: Operation = [logRequest('paths/projects', 'GET'), getProjects()];

GET.apiDoc = {
  description: 'Get all Projects.',
  tags: ['project'],
  security: [
    {
      Bearer: READ_ROLES
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
              ...(projectResponseBody as object)
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
function getProjects(): RequestHandler {
  return async (req, res) => {
    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const getProjectsSQLStatement = getProjectsSQL();

      if (!getProjectsSQLStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      const queryResponse: QueryResult = await connection.query(
        getProjectsSQLStatement.text,
        getProjectsSQLStatement.values
      );

      let rows: any[] = [];

      if (queryResponse && queryResponse.rows) {
        rows = queryResponse.rows;
      }

      let result: any[] = _extractProjects(rows);

      return res.status(200).json(result);
      
    } catch (error) {
      defaultLog.debug({ label: 'getProjects', message: 'error', error });
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
  let projects: any[] = []; 

  if (rows != null) {
    rows.forEach( (row) => {
      let project: any = {
        id: row.id,
        name: row.name,
        start_date: row.start_date,
        end_date: row.end_date,
        location_description: row.location_description
      };

      projects.push(project);
    });
  }

  return projects;
}
