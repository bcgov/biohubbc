import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { PostSurveyObject } from '../models/survey';
import { surveyPostBody, surveyResponseBody } from '../openapi/schemas/survey';
import { postSurveySQL } from '../queries/survey-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/survey');

export const POST: Operation = [logRequest('paths/survey', 'POST'), createSurvey()];

POST.apiDoc = {
  description: 'Create a new Survey.',
  tags: ['survey'],
  security: [
    {
      Bearer: WRITE_ROLES
    }
  ],
  requestBody: {
    description: 'Survey post request object.',
    content: {
      'application/json': {
        schema: {
          ...(surveyPostBody as object)
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Survey response object.',
      content: {
        'application/json': {
          schema: {
            ...(surveyResponseBody as object)
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
 * Creates a new survey record.
 *
 * @returns {RequestHandler}
 */
function createSurvey(): RequestHandler {
  return async (req, res) => {
    const sanitizedData = new PostSurveyObject(req.body);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const postSurveySQLStatement = postSurveySQL(sanitizedData);

      if (!postSurveySQLStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      await connection.open();

      const createResponse = await connection.query(postSurveySQLStatement.text, postSurveySQLStatement.values);

      await connection.commit();

      const result = (createResponse && createResponse.rows && createResponse.rows[0]) || null;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'createSurvey', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
