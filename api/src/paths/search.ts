import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { HTTP400 } from '../errors/CustomError';
import { projectIdResponseObject } from '../openapi/schemas/project';
import { getProjectListBySearchParamSQL } from '../queries/project/project-view-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/searchString');

export const POST: Operation = [logRequest('paths/searchString', 'POST'), getProjectListBySearchParam()];

POST.apiDoc = {
  description: 'Gets a list of projects and surveys based on search parameters.',
  tags: ['projects', 'surveys'],
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
            start_date: {
              type: 'string'
            },
            end_date: {
              type: 'string'
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
    401: {
      $ref: '#/components/responses/401'
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
function getProjectListBySearchParam(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const filterFields = req.body || null;

    try {
      const getProjectListBySearchParamSQLStatement = getProjectListBySearchParamSQL(filterFields);

      if (!getProjectListBySearchParamSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const response = await connection.query(
        getProjectListBySearchParamSQLStatement.text,
        getProjectListBySearchParamSQLStatement.values
      );

      console.log('HEYYYYYYYYYYYYYYYYYY');
      console.log(response);

      await connection.commit();

      let rows: any[] = [];

      if (response && response.rows) {
        rows = response.rows;
      }

      const result: any[] = _extractProjectsBySearchParam(rows);

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getProjectListBySearchParam', message: 'error', error });
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
export function _extractProjectsBySearchParam(rows: any[]): any[] {
  if (!rows || !rows.length) {
    return [];
  }

  const projects: any[] = [];

  rows.forEach((row) => {
    const project: any = {
      id: row.id,
      project_name: row.project_name,
      regions: row.regions,
      funding_agency_name: row.funding_agency_name,
      funding_agency_project_id: row.funding_agency_project_id,
      coordinator_agency_name: row.coordinator_agency_name,
      surveys: row.surveys,
      start_date: row.start_date,
      end_date: row.end_date,
      project_geometry: row.project_geometry && [JSON.parse(row.project_geometry)]
    };

    projects.push(project);
  });

  return projects;
}
