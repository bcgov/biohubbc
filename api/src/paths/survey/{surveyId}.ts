import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { READ_ROLES } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { surveyResponseBody } from '../../openapi/schemas/survey';
import { getSurveySQL } from '../../queries/survey-queries';
import { getLogger } from '../../utils/logger';
import { logRequest } from '../../utils/path-utils';

const defaultLog = getLogger('paths/survey/{surveyId}');

export const GET: Operation = [logRequest('paths/survey/{surveyId}', 'POST'), getSurvey()];

GET.apiDoc = {
  description: 'Fetch a survey by its ID.',
  tags: ['survey'],
  security: [
    {
      Bearer: READ_ROLES
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey with matching surveyId.',
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
 * Get a survey by its id.
 *
 * @returns {RequestHandler}
 */
function getSurvey(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getSurveySQLStatement = getSurveySQL(Number(req.params.surveyId));

      if (!getSurveySQLStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      await connection.open();

      const createResponse = await connection.query(getSurveySQLStatement.text, getSurveySQLStatement.values);

      await connection.commit();

      const result = (createResponse && createResponse.rows && createResponse.rows[0]) || null;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getSurvey', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
