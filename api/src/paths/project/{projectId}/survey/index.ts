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
  makePaginationOptionsFromRequest,
  makePaginationResponse
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
            additionalProperties: false,
            required: ['surveys', 'pagination'],
            properties: {
              pagination: { ...paginationResponseSchema },
              surveys: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['survey_id', 'name', 'start_date', 'end_date', 'progress_id', 'focal_species'],
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
                      description: 'ISO 8601 date string'
                    },
                    end_date: {
                      type: 'string',
                      description: 'ISO 8601 date string',
                      nullable: true
                    },
                    progress_id: {
                      type: 'integer'
                    },
                    focal_species: {
                      type: 'array',
                      items: {
                        type: 'integer'
                      }
                    },
                    focal_species_names: {
                      type: 'array',
                      items: {
                        type: 'string'
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
      const paginationOptions = makePaginationOptionsFromRequest(req);

      const surveyService = new SurveyService(connection);
      const surveys = await surveyService.getSurveysBasicFieldsByProjectId(
        projectId,
        ensureCompletePaginationOptions(paginationOptions)
      );
      const surveysTotalCount = await surveyService.getSurveyCountByProjectId(projectId);

      const response = {
        surveys,
        pagination: makePaginationResponse(surveysTotalCount, paginationOptions)
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
