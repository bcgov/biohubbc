import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/CustomError';
import { PostSurveyObject } from '../../../../models/survey-create';
import { surveyCreatePostRequestObject, surveyIdResponseObject } from '../../../../openapi/schemas/survey';
import { postSurveyProprietorSQL, postSurveySQL } from '../../../../queries/survey/survey-create-queries';
import { getLogger } from '../../../../utils/logger';
import { logRequest } from '../../../../utils/path-utils';

const defaultLog = getLogger('paths/project/{projectId}/survey/create');

export const POST: Operation = [logRequest('paths/project/{projectId}/survey/create', 'POST'), createSurvey()];

POST.apiDoc = {
  description: 'Create a new Survey.',
  tags: ['survey'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'Survey post request object.',
    content: {
      'application/json': {
        schema: {
          ...(surveyCreatePostRequestObject as object)
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
 * Creates a new survey record.
 *
 * @returns {RequestHandler}
 */
function createSurvey(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'Add a survey to a project',
      message: 'params and body',
      'req.params': req.params,
      'req.body': req.body
    });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }
    const connection = getDBConnection(req['keycloak_token']);

    const sanitizedPostSurveyData = (req.body && new PostSurveyObject(req.body)) || null;
    if (!sanitizedPostSurveyData) {
      throw new HTTP400('Missing survey data');
    }

    try {
      const postSurveySQLStatement = postSurveySQL(Number(req.params.projectId), sanitizedPostSurveyData);

      if (!postSurveySQLStatement) {
        throw new HTTP400('Failed to build survey SQL insert statement');
      }

      let surveyId: number;

      try {
        await connection.open();

        // Handle survey details
        const createSurveyResponse = await connection.query(postSurveySQLStatement.text, postSurveySQLStatement.values);

        const surveyResult =
          (createSurveyResponse && createSurveyResponse.rows && createSurveyResponse.rows[0]) || null;

        if (!surveyResult || !surveyResult.id) {
          throw new HTTP400('Failed to create the survey record');
        }

        surveyId = surveyResult.id;

        if (sanitizedPostSurveyData.survey_proprietor) {
          const postSurveyProprietorSQLStatement = postSurveyProprietorSQL(
            surveyId,
            sanitizedPostSurveyData.survey_proprietor
          );

          if (!postSurveyProprietorSQLStatement) {
            throw new HTTP400('Failed to build survey_proprietor SQL insert statement');
          }

          const createSurveyProprietorResponse = await connection.query(
            postSurveyProprietorSQLStatement.text,
            postSurveyProprietorSQLStatement.values
          );

          const surveyProprietorResult =
            (createSurveyProprietorResponse &&
              createSurveyProprietorResponse.rows &&
              createSurveyProprietorResponse.rows[0]) ||
            null;

          if (!surveyProprietorResult || !surveyProprietorResult.id) {
            throw new HTTP400('Failed to create the survey proprietor record');
          }
        }

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }

      return res.status(200).json({ id: surveyId });
    } catch (error) {
      defaultLog.debug({ label: 'createSurvey', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
