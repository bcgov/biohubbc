import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import moment from 'moment';
import { COMPLETION_STATUS } from '../../constants/status';
import { getAPIUserDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/custom-error';
import { projectIdResponseObject } from '../../openapi/schemas/project';
import { queries } from '../../queries/queries';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/public/projects');

export const GET: Operation = [getPublicProjectsList()];

GET.apiDoc = {
  description: 'Gets a list of public facing (published) projects.',
  tags: ['public', 'projects'],
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
 * Get all public facing (published) projects.
 *
 * @returns {RequestHandler}
 */
export function getPublicProjectsList(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const getProjectListSQLStatement = queries.public.getPublicProjectListSQL();

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
      defaultLog.error({ label: 'getPublicProjectsList', message: 'error', error });
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
      completion_status:
        (row.end_date && moment(row.end_date).endOf('day').isBefore(moment()) && COMPLETION_STATUS.COMPLETED) ||
        COMPLETION_STATUS.ACTIVE,
      project_type: row.project_type,
      permits_list: row.permits_list
    };

    projects.push(project);
  });

  return projects;
}
