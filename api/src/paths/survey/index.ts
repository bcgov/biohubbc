import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { ISurveyAdvancedFilters } from '../../models/survey-view';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { SurveyService } from '../../services/survey-service';
import { setCacheControl } from '../../utils/api-utils';
import { getLogger } from '../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../utils/pagination';

const defaultLog = getLogger('paths/survey/index');

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
  getSurveys()
];

GET.apiDoc = {
  description: "Gets a list of surveys based on the user's permissions and search criteria.",
  tags: ['surveys'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'start_date',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'end_date',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'project_programs',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'integer'
        },
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'keyword',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'project_name',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'itis_tsns',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'integer'
        }
      }
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'Survey response object.',
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
                    'progress_id',
                    'start_date',
                    'end_date',
                    'regions',
                    'focal_species',
                    'types'
                  ],
                  properties: {
                    project_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    survey_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    name: {
                      type: 'string'
                    },
                    progress_id: {
                      type: 'integer',
                      minimum: 1
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
                    }
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
 * Get surveys for the current user, based on their permissions and search criteria.
 *
 * @returns {RequestHandler}
 */
export function getSurveys(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getSurveys' });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        req['system_user']['role_names']
      );

      const filterFields = {
        ...parseQueryParams(req)
      };

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const surveyService = new SurveyService(connection);

      const surveys = await surveyService.findSurveys(
        isUserAdmin,
        systemUserId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );

      const surveysTotalCount = await surveyService.findSurveyCount(isUserAdmin, systemUserId, filterFields);

      await connection.commit();

      const response = {
        surveys,
        pagination: makePaginationResponse(surveysTotalCount, paginationOptions)
      };

      setCacheControl(res, 30);

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getSurveys', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

function parseQueryParams(req: Request): ISurveyAdvancedFilters {
  return {
    keyword: req.params.keyword && String(req.params.keyword),
    project_name: req.params.project_name && String(req.params.project_name),
    project_programs: req.params.project_programs
      ? String(req.params.project_programs).split(',').map(Number)
      : undefined,
    itis_tsns: req.params.itis_tsns ? String(req.params.itis_tsns).split(',').map(Number) : undefined,
    start_date: req.params.start_date && String(req.params.start_date),
    end_date: req.params.end_date && String(req.params.end_date)
  };
}
