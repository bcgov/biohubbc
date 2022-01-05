import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400, HTTP500 } from '../../../errors/custom-error';
import { projectIdResponseObject } from '../../../openapi/schemas/project';
import { queries } from '../../../queries/queries';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/publish');

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  publishProject()
];

PUT.apiDoc = {
  description: 'Publish or unpublish a project.',
  tags: ['project'],
  security: [
    {
      Bearer: []
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
    description: 'Publish or unpublish put request object.',
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
export function publishProject(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params.projectId);

      if (!projectId) {
        throw new HTTP400('Missing required path parameter: projectId');
      }

      if (!req.body) {
        throw new HTTP400('Missing request body');
      }

      if (req.body.publish === undefined) {
        throw new HTTP400('Missing publish flag in request body');
      }

      const publish: boolean = req.body.publish;

      const sqlStatement = queries.project.updateProjectPublishStatusSQL(projectId, publish);

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
      return res.status(200).json({ id: result.id });
    } catch (error) {
      defaultLog.error({ label: 'publishProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
