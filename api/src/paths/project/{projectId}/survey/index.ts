import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../../../openapi/schemas/pagination';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../services/survey-service';
import { getLogger } from '../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  getPaginationOptionsFromRequest,
  getPaginationResponse
} from '../../../../utils/pagination';

const defaultLog = getLogger('paths/project/{projectId}/survey/index');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveys()
];

GET.apiDoc = {
  description: 'Fetches a subset of survey fields for all surveys under a project.',
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
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'Survey list response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['surveys' /*pagination*/], // TODO
            properties: {
              pagination: { ...paginationResponseSchema },
              surveys: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['survey_id', 'name', 'start_date', 'end_date', 'focal_species'],
                  properties: {
                    survey_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    name: {
                      type: 'string',
                      maxLength: 300
                    },
                    start_date: {
                      type: 'string',
                      format: 'date',
                      description: 'ISO 8601 date string'
                    },
                    end_date: {
                      type: 'string',
                      format: 'date',
                      description: 'ISO 8601 date string',
                      nullable: true
                    },
                    focal_species: {
                      type: 'array',
                      items: {
                        type: 'integer'
                      }
                    }
                  }
                }
              }
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
      $ref: '#/components/responses/403'
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
 * Get a subset of survey fields for all surveys under a project.
 *
 * @returns {RequestHandler}
 */
export function getSurveys(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const projectId = Number(req.params.projectId);
      const paginationOptions = getPaginationOptionsFromRequest(req);

      const surveyService = new SurveyService(connection);
      const surveys = await surveyService.getSurveysBasicFieldsByProjectId(
        projectId,
        ensureCompletePaginationOptions(paginationOptions)
      );
      const surveysTotalCount = await surveyService.getSurveyCountByProjectId(projectId);

      const response = {
        surveys,
        pagination: getPaginationResponse(surveysTotalCount, paginationOptions)
      };

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
