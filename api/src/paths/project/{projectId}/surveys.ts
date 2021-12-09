import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import moment from 'moment';
import { PROJECT_ROLE } from '../../../constants/roles';
import { COMPLETION_STATUS } from '../../../constants/status';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/CustomError';
import { GetSurveyListData } from '../../../models/survey-view';
import { surveyIdResponseObject } from '../../../openapi/schemas/survey';
import { getSurveyListSQL } from '../../../queries/survey/survey-view-queries';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/surveys');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getSurveyList()
];

GET.apiDoc = {
  description: 'Get all Surveys.',
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
    }
  ],
  responses: {
    200: {
      description: 'Survey response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              ...(surveyIdResponseObject as object)
            }
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
 * Get all surveys.
 *
 * @returns {RequestHandler}
 */
export function getSurveyList(): RequestHandler {
  return async (req, res) => {
    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getSurveyListSQLStatement = getSurveyListSQL(Number(req.params.projectId));

      if (!getSurveyListSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const getSurveyListResponse = await connection.query(
        getSurveyListSQLStatement.text,
        getSurveyListSQLStatement.values
      );

      await connection.commit();

      let rows: any[] = [];

      if (getSurveyListResponse && getSurveyListResponse.rows && new GetSurveyListData(getSurveyListResponse.rows)) {
        rows = new GetSurveyListData(getSurveyListResponse.rows).surveys;
      }

      const result: any[] = _extractSurveys(rows);

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Extract an array of survey data from DB query.
 *
 * @export
 * @param {any[]} rows DB query result rows
 * @return {any[]} An array of survey data
 */
export function _extractSurveys(rows: any[]): any[] {
  if (!rows || !rows.length) {
    return [];
  }

  const surveys: any[] = [];

  rows.forEach((row) => {
    const survey: any = {
      id: row.id,
      name: row.name,
      species: row.species,
      start_date: row.start_date,
      end_date: row.end_date,
      publish_status: row.publish_timestamp ? 'Published' : 'Unpublished',
      completion_status:
        (row.end_date && moment(row.end_date).endOf('day').isBefore(moment()) && COMPLETION_STATUS.COMPLETED) ||
        COMPLETION_STATUS.ACTIVE
    };

    surveys.push(survey);
  });

  return surveys;
}
