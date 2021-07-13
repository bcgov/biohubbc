'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/CustomError';
import { GetSurveyFundingSources } from '../../../../../models/survey-view';
import { getFundingSourceByProjectSQL } from '../../../../../queries/project/project-view-update-queries';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/funding-sources/list');

export const GET: Operation = [getSurveyFundingSources()];

GET.apiDoc = {
  description: 'Fetches a list of funding sources for a survey based on a project.',
  tags: ['funding_sources'],
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
    }
  ],
  responses: {
    200: {
      description: 'Funding sources get response array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'Funding Sources Get Response Object',
              type: 'object',
              properties: {
                pfsId: {
                  type: 'number'
                },
                amount: {
                  type: 'number'
                },
                startDate: {
                  type: 'string'
                },
                endDate: {
                  type: 'string'
                },
                agencyName: {
                  type: 'string'
                }
              }
            },
            description: 'Funding sources applicable for the survey'
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

export function getSurveyFundingSources(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get survey funding sources list', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getSurveyFundingSourcesSQLStatement = getFundingSourceByProjectSQL(Number(req.params.projectId));

      if (!getSurveyFundingSourcesSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const surveyFundingSourcesData = await connection.query(
        getSurveyFundingSourcesSQLStatement.text,
        getSurveyFundingSourcesSQLStatement.values
      );

      await connection.commit();

      const getSurveyFundingSourcesData =
        (surveyFundingSourcesData &&
          surveyFundingSourcesData.rows &&
          new GetSurveyFundingSources(surveyFundingSourcesData.rows)) ||
        null;

      return res.status(200).json(getSurveyFundingSourcesData?.fundingSources);
    } catch (error) {
      defaultLog.debug({ label: 'getSurveyFundingSources', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
