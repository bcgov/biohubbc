import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { PostTemplateObj } from '../models/template';
import { templatePostBody, templateResponseBody } from '../openapi/schemas/template';
import { postTemplateSQL } from '../queries/template-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';
import { isValidJSONSchema } from '../utils/template-utils';

const defaultLog = getLogger('paths/template');

export const POST: Operation = [logRequest('paths/template', 'POST'), createTemplate()];

POST.apiDoc = {
  description: 'Create a new template.',
  tags: ['template'],
  security: [
    {
      Bearer: WRITE_ROLES
    }
  ],
  requestBody: {
    description: 'Request body to create a new template',
    content: {
      'application/json': {
        schema: {
          ...(templatePostBody as object)
        }
      }
    }
  },
  responses: {
    200: {
      description: 'The newly created template.',
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
 * Creates a new template record.
 *
 * @returns {RequestHandler}
 */
function createTemplate(): RequestHandler {
  return async (req, res) => {
    const sanitizedData = new PostTemplateObj(req.body);

    const validationResult = isValidJSONSchema(sanitizedData.data_template);

    if (!validationResult.isValid) {
      throw {
        status: 400,
        message: 'Data template is invalid',
        errors: validationResult.errors
      };
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const createTemplateSQLStatement = postTemplateSQL(sanitizedData);

      if (!createTemplateSQLStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      await connection.open();

      const createResponse = await connection.query(createTemplateSQLStatement.text, createTemplateSQLStatement.values);

      await connection.commit();

      const result = (createResponse && createResponse.rows && createResponse.rows[0]) || null;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'createTemplate', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
