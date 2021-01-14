import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { QueryResult } from 'pg';
import { WRITE_ROLES } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { PostProjectObject } from '../models/project';
import { projectPostBody, projectResponseBody } from '../openapi/schemas/project';
import { postProjectSQL } from '../queries/project-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/project');

export const POST: Operation = [logRequest('paths/project', 'POST'), createProject()];

POST.apiDoc = {
  description: 'Create a new Project.',
  tags: ['project'],
  security: [
    {
      Bearer: WRITE_ROLES
    }
  ],
  requestBody: {
    description: 'Project post request object.',
    content: {
      'application/json': {
        schema: {
          ...(projectPostBody as object)
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
            ...(projectResponseBody as object)
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
 * Creates a new project record.
 *
 * @returns {RequestHandler}
 */
function createProject(): RequestHandler {
  return async (req, res) => {
    const sanitizedProjectData = new PostProjectObject(req.body.project);

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const postProjectSQLStatement = postProjectSQL(sanitizedProjectData);

      if (!postProjectSQLStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      let createProjectResponse: QueryResult;

      try {
        await connection.query('BEGIN');

        createProjectResponse = await connection.query(postProjectSQLStatement.text, postProjectSQLStatement.values);

        // TODO populate other related tables that have the project id as a foreign key

        await connection.query('COMMIT');
      } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
      }

      const result = (createProjectResponse && createProjectResponse.rows && createProjectResponse.rows[0]) || null;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'createProject', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
