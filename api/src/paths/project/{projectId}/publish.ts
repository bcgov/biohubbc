import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400, HTTP500 } from '../../../errors/CustomError';
import { projectIdResponseObject } from '../../../openapi/schemas/project';
import { getLogger } from '../../../utils/logger';
import { logRequest } from '../../../utils/path-utils';
import { updateProjectPublishStatusSQL } from '../../../queries/project/project-update-queries';

const defaultLog = getLogger('paths/project/{projectId}/publish');

export const PUT: Operation = [logRequest('paths/project/{projectId}/publish', 'PUT'), publishProject()];

PUT.apiDoc = {
  description: 'Publish a project.',
  tags: ['project'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Publish put request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Publish request object',
          type: 'object',
          required: ['publish'],
          properties: {
            publish: {
              title: 'publish?',
              type: 'boolean'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Project publish request completed successfully.',
      content: {
        'application/json': {
          schema: {
            // TODO is there any return value? or is it just an HTTP status with no content?
            ...(projectIdResponseObject as object)
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
 * Update a project.
 *
 * @returns {RequestHandler}
 */
function publishProject(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params?.projectId);

      const publish: boolean = req.body?.publish;

      if (!projectId) {
        throw new HTTP400('Missing required path parameter: projectId');
      }

      if (!projectId) {
        throw new HTTP400('Missing required path parameter: projectId');
      }

      const sqlStatement = updateProjectPublishStatusSQL(projectId, publish);

      if (!sqlStatement) {
        throw new HTTP400('Failed to build SQL statement');
      }

      await connection.open();

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      const result = (response && response.rows && response.rows[0]) || null;

      if (!response || !result) {
        throw new HTTP500('Failed to update project publish status');
      }

      await connection.commit();

      return res.status(200).send(result);
    } catch (error) {
      defaultLog.debug({ label: 'updateProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
