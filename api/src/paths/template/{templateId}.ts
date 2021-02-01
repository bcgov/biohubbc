import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { READ_ROLES } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { templateResponseBody } from '../../openapi/schemas/template';
import { getTemplateSQL } from '../../queries/template-queries';
import { getLogger } from '../../utils/logger';
import { logRequest } from '../../utils/path-utils';

const defaultLog = getLogger('paths/template/{templateId}');

export const GET: Operation = [logRequest('paths/template/{templateId}', 'POST'), getTemplate()];

GET.apiDoc = {
  description: 'Fetch a template by its ID.',
  tags: ['template'],
  security: [
    {
      Bearer: READ_ROLES
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'templateId',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Template with matching templateId.',
      content: {
        'application/json': {
          schema: {
            ...(templateResponseBody as object)
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
 * Get a template by its id.
 *
 * @returns {RequestHandler}
 */
function getTemplate(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getTemplateSQLStatement = getTemplateSQL(Number(req.params.templateId));

      if (!getTemplateSQLStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      await connection.open();

      const createResponse = await connection.query(getTemplateSQLStatement.text, getTemplateSQLStatement.values);

      await connection.commit();

      const result = (createResponse && createResponse.rows && createResponse.rows[0]) || null;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getTemplate', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
