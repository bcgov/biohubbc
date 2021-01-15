import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { QueryResult } from 'pg';
import { READ_ROLES } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { projectResponseBody } from '../openapi/schemas/project';
import { getProjectsSQL } from '../queries/project-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';
import moment from 'moment';

const defaultLog = getLogger('paths/project');

export const GET: Operation = [logRequest('paths/project', 'POST'), getProjects()];

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
 * Get all projecst.
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
      const getProjectsSQLStatement = getProjectsSQL(req.params.projectId);

      if (!getProjectsSQLStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      const createResponse: QueryResult = await connection.query(
        getProjectsSQLStatement.text,
        getProjectsSQLStatement.values
      );

      const result = (createResponse && createResponse.rows && createResponse.rows[0]) || null;

      res.status(200).json(result);

      //return res.status(200).json(result);

      return [
        {
          id: 1,
          name: 'Project Name 1',
          objectives: 'Project Objectives 1',
          scientific_collection_permit_number: '123456',
          management_recovery_action: 'A',
          location_description: 'Location Description',
          start_date: moment().format("MM/D/YY"),
          end_date: moment().format("MM/D/YY"),
          results: 'Results 1',
          caveats: 'Caveats 1',
          comments: 'Comments 1'
        }
        // {
        //   id: 2,
        //   name: 'Project Name 2',
        //   objectives: 'Project Objectives 2',
        //   scientific_collection_permit_number: '123456',
        //   management_recovery_action: 'A',
        //   location_description: 'Location Description 2',
        //   start_date: moment().format("MM/D/YY"),
        //   end_date: moment().format("MM/D/YY"),
        //   results: 'Results 2',
        //   caveats: 'Caveats 2',
        //   comments: 'Comments 2'
        // },
        // {
        //   id: 3,
        //   name: 'Project Name 3',
        //   objectives: 'Project Objectives 3',
        //   scientific_collection_permit_number: '123456',
        //   management_recovery_action: 'A',
        //   location_description: 'Location Description 3',
        //   start_date: moment().format("MM/D/YY"),
        //   end_date: moment().format("MM/D/YY"),
        //   results: 'Results 3',
        //   caveats: 'Caveats 3',
        //   comments: 'Comments 3'
        // },
        // {
        //   id: 4,
        //   name: 'Project Name 4',
        //   objectives: 'Project Objectives 4',
        //   scientific_collection_permit_number: '123456',
        //   management_recovery_action: 'A',
        //   location_description: 'Location Description 4',
        //   start_date: moment().format("MM/D/YY"),
        //   end_date: moment().format("MM/D/YY"),
        //   results: 'Results 4',
        //   caveats: 'Caveats 4',
        //   comments: 'Comments 4'
        // }
      ];
    } catch (error) {
      defaultLog.debug({ label: 'getProjects', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
