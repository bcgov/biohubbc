import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { ProjectService } from '../../../../../services/project-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/funding-sources/list');

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
  getSurveyFundingSources()
];

GET.apiDoc = {
  description: 'Fetches a list of project funding sources available for use by a survey.',
  tags: ['funding_sources'],
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
      description: 'Funding sources get response array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            description: 'Funding sources applicable for the survey',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'number'
                },
                agency_id: {
                  type: 'number'
                },
                investment_action_category: {
                  type: 'number'
                },
                investment_action_category_name: {
                  type: 'string'
                },
                agency_name: {
                  type: 'string'
                },
                funding_amount: {
                  type: 'number'
                },
                start_date: {
                  type: 'string',
                  format: 'date',
                  description: 'ISO 8601 date string for the funding start date'
                },
                end_date: {
                  type: 'string',
                  format: 'date',
                  description: 'ISO 8601 date string for the funding end_date'
                },
                agency_project_id: {
                  type: 'string',
                  nullable: true
                },
                revision_count: {
                  type: 'number'
                }
              }
            }
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
      await connection.open();

      const projectService = new ProjectService(connection);

      const response = await projectService.getFundingData(Number(req.params.projectId));

      return res.status(200).json(response.fundingSources);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyFundingSources', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
