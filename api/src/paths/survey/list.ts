import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { ISurveyAdvancedFilters } from '../../models/survey-view';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { SurveyService } from '../../services/survey-service';
import { getLogger } from '../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../utils/pagination';

const defaultLog = getLogger('paths/surveys');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getSurveyList()
];

GET.apiDoc = {
  description: 'Gets a list of surveys based on search parameters if passed in.',
  tags: ['surveys'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [...paginationRequestQueryParamSchema],
  requestBody: {
    description: 'Project list search filter criteria object.',
    content: {
      'application/json': {
        schema: {
          properties: {
            start_date: {
              type: 'string',
              nullable: true
            },
            end_date: {
              type: 'string',
              nullable: true
            },
            project_programs: {
              type: 'array',
              items: {
                type: 'integer'
              },
              nullable: true
            },
            keyword: {
              type: 'string',
              nullable: true
            },
            project_name: {
              type: 'string',
              nullable: true
            },
            itis_tsns: {
              type: 'array',
              items: {
                type: 'integer'
              }
            },
            system_user_id: {
              type: 'integer'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Project response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['surveys', 'pagination'],
            properties: {
              surveys: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: [
                    'project_id',
                    'survey_id',
                    'name',
                    'start_date',
                    'end_date',
                    'focal_species',
                    'regions'
                  ],
                  properties: {
                    project_id: {
                      type: 'integer'
                    },
                    survey_id: {
                      type: 'integer'
                    },
                    name: {
                      type: 'string'
                    },
                    progress_id: {
                      type: 'integer'
                    },
                    start_date: {
                      oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                      nullable: true,
                      description: 'ISO 8601 date string for the survey end_date'
                    },
                    end_date: {
                      oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                      nullable: true,
                      description: 'ISO 8601 date string for the survey end_date'
                    },
                    regions: {
                      type: 'array',
                      items: {
                        type: 'string',
                        nullable: true
                      }
                    },
                    focal_species: {
                      type: 'array',
                      items: {
                        type: 'integer',
                        nullable: true
                      }
                    },
                    types: {
                      type: 'array',
                      items: {
                        type: 'integer',
                        nullable: true
                      }
                    },
                  }
                }
              },
              pagination: { ...paginationResponseSchema }
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
 * Get all surveys (potentially based on filter criteria) from any project.
 *
 * @returns {RequestHandler}
 */
export function getSurveyList(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getSurveyList' });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        req['system_user']['role_names']
      );
      const systemUserId = connection.systemUserId();
      const filterFields: ISurveyAdvancedFilters = {
        keyword: req.query.keyword && String(req.query.keyword),
        project_name: req.query.project_name && String(req.query.project_name),
        project_programs: req.query.project_programs
          ? String(req.query.project_programs).split(',').map(Number)
          : undefined,
        itis_tsns: req.query.itis_tsns ? String(req.query.itis_tsns).split(',').map(Number) : undefined,
        start_date: req.query.start_date && String(req.query.start_date),
        end_date: req.query.end_date && String(req.query.end_date),
        system_user_id: req.query.system_user_id && String(req.query.system_user_id)
      };

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const surveyService = new SurveyService(connection);
      const surveys = await surveyService.getSurveyList(
        isUserAdmin,
        systemUserId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );

      const surveysTotalCount = await surveyService.getSurveyCountByUserId(isUserAdmin, systemUserId, filterFields);

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
