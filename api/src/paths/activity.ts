import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { PostActivityObject } from '../models/activity';
import { activityPostBody, activityResponseBody } from '../openapi/schemas/activity';
import { postActivitySQL } from '../queries/activity-queries';
import { getTemplateSQL } from '../queries/template-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';
import { isJSONObjectValidForJSONSchema } from '../utils/template-utils';

const defaultLog = getLogger('paths/activity');

export const POST: Operation = [logRequest('paths/activity', 'POST'), createActivity()];

POST.apiDoc = {
  description: 'Create a new activity.',
  tags: ['activity'],
  security: [
    {
      Bearer: WRITE_ROLES
    }
  ],
  requestBody: {
    description: 'Activity post request object.',
    content: {
      'application/json': {
        schema: {
          ...(activityPostBody as object)
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Activity response object.',
      content: {
        'application/json': {
          schema: {
            ...(activityResponseBody as object)
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
 * Creates a new activity record.
 *
 * @returns {RequestHandler}
 */
function createActivity(): RequestHandler {
  return async (req, res) => {
    const sanitizedData = new PostActivityObject(req.body);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getTemplateSQLStatement = getTemplateSQL(sanitizedData.template_id);
      const postActivitySQLStatement = postActivitySQL(sanitizedData);

      if (!getTemplateSQLStatement || !postActivitySQLStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      let createResponse;

      try {
        // Perform both get and create operations as a single transaction
        await connection.open();

        const getResponse = await connection.query(getTemplateSQLStatement.text, getTemplateSQLStatement.values);

        if (!getResponse || !getResponse.rowCount) {
          // Found 0 matching templates, expecting 1
          await connection.commit();

          throw {
            status: 400,
            message: `No matching template found`
          };
        }

        if (getResponse.rowCount > 1) {
          // Found more than 1 matching templates, expecting 1
          await connection.commit();

          throw {
            status: 500,
            message: `Multiple matching templates found`
          };
        }

        const data_template = getResponse.rows[0].data_template;

        const validationResult = isJSONObjectValidForJSONSchema(sanitizedData.form_data, data_template);

        if (!validationResult || !validationResult.isValid) {
          // Form data does not conform to the specified template
          await connection.commit();

          throw {
            status: 400,
            message: `Form data does not conform to the matching template`,
            errors: validationResult.errors
          };
        }

        createResponse = await connection.query(postActivitySQLStatement.text, postActivitySQLStatement.values);

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }

      const result = (createResponse && createResponse.rows && createResponse.rows[0]) || null;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'createActivity', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
