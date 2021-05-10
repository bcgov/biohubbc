import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400, HTTP409 } from '../../../../../errors/CustomError';
import { PutSurveyData } from '../../../../../models/survey-update';
import { GetSurveyData } from '../../../../../models/survey-view-update';
import {
  surveyIdResponseObject,
  surveyUpdateGetResponseObject,
  surveyUpdatePutRequestObject
} from '../../../../../openapi/schemas/survey';
import { putSurveySQL } from '../../../../../queries/survey/survey-update-queries';
import { getSurveySQL } from '../../../../../queries/survey/survey-view-update-queries';
import { getLogger } from '../../../../../utils/logger';
import { logRequest } from '../../../../../utils/path-utils';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/update');

export const GET: Operation = [
  logRequest('paths/project/{projectId}/survey/{surveyId}/update', 'GET'),
  getSurveyForUpdate()
];

export const PUT: Operation = [logRequest('paths/project/{projectId}/survey/{surveyId}/update', 'PUT'), updateSurvey()];

GET.apiDoc = {
  description: 'Get a project survey, for update purposes.',
  tags: ['survey'],
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
    },
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
            ...(surveyUpdateGetResponseObject as object)
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

PUT.apiDoc = {
  description: 'Update a survey.',
  tags: ['survey'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'Survey put request object.',
    content: {
      'application/json': {
        schema: {
          ...(surveyUpdatePutRequestObject as object)
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Survey with matching surveyId.',
      content: {
        'application/json': {
          schema: {
            ...(surveyIdResponseObject as object)
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
 * Get a survey by projectId and surveyId.
 *
 * @returns {RequestHandler}
 */
function getSurveyForUpdate(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getSurveySQLStatement = getSurveySQL(Number(req.params.projectId), Number(req.params.surveyId));

      if (!getSurveySQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const surveyData = await connection.query(getSurveySQLStatement.text, getSurveySQLStatement.values);

      await connection.commit();

      const getSurveyData =
        (surveyData && surveyData.rows && surveyData.rows[0] && new GetSurveyData(surveyData.rows[0])) || null;

      defaultLog.debug('Get survey for update result:', getSurveyData);

      return res.status(200).json(getSurveyData);
    } catch (error) {
      defaultLog.debug({ label: 'getSurveyForUpdate', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Update a survey.
 *
 * @returns {RequestHandler}
 */
function updateSurvey(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params.projectId);
      const surveyId = Number(req.params.surveyId);
      const surveyData = req.body;

      if (!projectId) {
        throw new HTTP400('Missing required path parameter: projectId');
      }

      if (!surveyId) {
        throw new HTTP400('Missing required path parameter: surveyId');
      }

      if (!surveyData) {
        throw new HTTP400('Missing required request body');
      }

      await connection.open();

      const putSurveyData = (surveyData && new PutSurveyData(surveyData)) || null;

      // Update survey table
      const revision_count = putSurveyData?.revision_count ?? null;

      if (!revision_count && revision_count !== 0) {
        throw new HTTP400('Failed to parse request body');
      }

      const sqlUpdateSurvey = putSurveySQL(projectId, surveyId, putSurveyData, revision_count);

      if (!sqlUpdateSurvey) {
        throw new HTTP400('Failed to build SQL update statement');
      }

      const result = await connection.query(sqlUpdateSurvey.text, sqlUpdateSurvey.values);

      if (!result || !result.rowCount) {
        throw new HTTP409('Failed to update stale survey data');
      }

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.debug({ label: 'updateSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
