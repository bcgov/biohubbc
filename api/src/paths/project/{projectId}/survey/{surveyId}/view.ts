import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/CustomError';
import { GetViewSurveyDetailsData } from '../../../../../models/survey-view';
import { GetSurveyProprietorData } from '../../../../../models/survey-view-update';
import { surveyViewGetResponseObject } from '../../../../../openapi/schemas/survey';
import {
  getSurveyBasicDataForViewSQL,
  getSurveyFundingSourcesDataForViewSQL,
  getSurveySpeciesDataForViewSQL
} from '../../../../../queries/survey/survey-view-queries';
import { getSurveyProprietorForUpdateSQL } from '../../../../../queries/survey/survey-view-update-queries';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/view');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [
            PROJECT_ROLE.PROJECT_LEAD,
            PROJECT_ROLE.PROJECT_REVIEWER,
            PROJECT_ROLE.PROJECT_TEAM_MEMBER
          ],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getSurveyForView()
];

GET.apiDoc = {
  description: 'Get a project survey, for view-only purposes.',
  tags: ['survey'],
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

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const surveyId = Number(req.params.surveyId);

    try {
      await connection.open();

      const [surveyBasicData, surveyFundingSourcesData, SurveySpeciesData, surveyProprietorData] = await Promise.all([
        getSurveyBasicDataForView(surveyId, connection),
        getSurveyFundingSourcesDataForView(surveyId, connection),
        getSurveySpeciesDataForView(surveyId, connection),
        getSurveyProprietorDataForView(surveyId, connection)
      ]);

      await connection.commit();

      const getSurveyData = new GetViewSurveyDetailsData({
        ...surveyBasicData,
        funding_sources: surveyFundingSourcesData,
        ...SurveySpeciesData
      });

      const getSurveyProprietorData =
        (surveyProprietorData && new GetSurveyProprietorData(surveyProprietorData)) || null;

      const result = {
        survey_details: getSurveyData,
        survey_proprietor: getSurveyProprietorData
      };

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const getSurveyBasicDataForView = async (surveyId: number, connection: IDBConnection): Promise<object> => {
  const sqlStatement = getSurveyBasicDataForViewSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to get survey basic data');
  }

  return (response && response.rows?.[0]) || null;
};

export const getSurveyFundingSourcesDataForView = async (
  surveyId: number,
  connection: IDBConnection
): Promise<any[]> => {
  const sqlStatement = getSurveyFundingSourcesDataForViewSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response) {
    throw new HTTP400('Failed to get survey funding sources data');
  }

  return (response && response.rows) || [];
};

export const getSurveySpeciesDataForView = async (surveyId: number, connection: IDBConnection): Promise<any[]> => {
  const sqlStatement = getSurveySpeciesDataForViewSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to get survey species data');
  }

  return (response && response.rows?.[0]) || null;
};

export const getSurveyProprietorDataForView = async (surveyId: number, connection: IDBConnection) => {
  const sqlStatement = getSurveyProprietorForUpdateSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return (response && response.rows?.[0]) || null;
};
