import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/CustomError';
import { GetSurveyProprietorData } from '../../../../../models/survey-view';
import { GetSurveyData } from '../../../../../models/survey-view-update';
import { surveyViewGetResponseObject } from '../../../../../openapi/schemas/survey';
import { getSurveyProprietorSQL } from '../../../../../queries/survey/survey-view-queries';
import { getSurveySQL } from '../../../../../queries/survey/survey-view-update-queries';
import { getLogger } from '../../../../../utils/logger';
import { logRequest } from '../../../../../utils/path-utils';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/view');

export const GET: Operation = [
  logRequest('paths/project/{projectId}/survey/{surveyId}/view', 'GET'),
  getSurveyForView()
];

GET.apiDoc = {
  description: 'Get a project survey, for view-only purposes.',
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
            ...(surveyViewGetResponseObject as object)
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
export function getSurveyForView(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getSurveySQLStatement = getSurveySQL(Number(req.params.projectId), Number(req.params.surveyId));
      const getSurveyProprietorSQLStatement = getSurveyProprietorSQL(Number(req.params.surveyId));

      if (!getSurveySQLStatement || !getSurveyProprietorSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const [surveyData, surveyProprietorData] = await Promise.all([
        await connection.query(getSurveySQLStatement.text, getSurveySQLStatement.values),
        await connection.query(getSurveyProprietorSQLStatement.text, getSurveyProprietorSQLStatement.values)
      ]);

      await connection.commit();

      const getSurveyData =
        (surveyData && surveyData.rows && surveyData.rows[0] && new GetSurveyData(surveyData.rows[0])) || null;

      const getSurveyProprietorData =
        (surveyProprietorData &&
          surveyProprietorData.rows &&
          surveyProprietorData.rows[0] &&
          new GetSurveyProprietorData(surveyProprietorData.rows[0])) ||
        null;

      const result = {
        id: req.params.surveyId,
        survey: getSurveyData,
        surveyProprietor: getSurveyProprietorData
      };

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getSurveyForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
