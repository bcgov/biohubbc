import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
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
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getProjectsSQLStatement = getProjectsSQL();

      if (!getProjectsSQLStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      await connection.open();

      const getProjectsResponse = await connection.query(getProjectsSQLStatement.text, getProjectsSQLStatement.values);

      await connection.commit();

      let rows: any[] = [];

      if (getProjectsResponse && getProjectsResponse.rows) {
        rows = getProjectsResponse.rows;
      }

      const result: any[] = _extractProjects(rows);

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
  const projects: any[] = [];

  if (rows != null) {
    rows.forEach((row) => {
      const project: any = {
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
