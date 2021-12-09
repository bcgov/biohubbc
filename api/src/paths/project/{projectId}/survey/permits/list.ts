'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/CustomError';
import { getAllAssignablePermitsForASurveySQL } from '../../../../../queries/survey/survey-view-queries';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/permits/list');

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
  getSurveyPermits()
];

GET.apiDoc = {
  description: 'Fetches a list of permits for a survey based on a project.',
  tags: ['permits'],
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
      description: 'Permits get response array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'Survey permit Get Response Object',
              type: 'object',
              properties: {
                number: {
                  type: 'string'
                },
                type: {
                  type: 'string'
                }
              }
            },
            description: 'Permits applicable for the survey'
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function getSurveyPermits(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get survey permits list', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getSurveyPermitsSQLStatement = getAllAssignablePermitsForASurveySQL(Number(req.params.projectId));

      if (!getSurveyPermitsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const surveyPermitsData = await connection.query(
        getSurveyPermitsSQLStatement.text,
        getSurveyPermitsSQLStatement.values
      );

      await connection.commit();

      const getSurveyPermitsData = (surveyPermitsData && surveyPermitsData.rows) || null;

      return res.status(200).json(getSurveyPermitsData);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyPermits', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
