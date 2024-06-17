import { Request, RequestHandler } from 'express';
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
  findSurveys()
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
      name: 'keyword',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'itis_tsns',
      description: 'ITIS TSN numbers',
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
      name: 'itis_tsn',
      description: 'ITIS TSN number',
      required: false,
      schema: {
        type: 'integer',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'start_date',
      description: 'ISO 8601 datetime string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'end_date',
      description: 'ISO 8601 datetime string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'survey_name',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'system_user_id',
      required: false,
      schema: {
        type: 'number',
        minimum: 1,
        nullable: true
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
                      type: 'string',
                      description: 'ISO 8601 datetime string',
                      nullable: true
                    },
                    end_date: {
                      type: 'string',
                      description: 'ISO 8601 datetime string',
                      nullable: true
                    },
                    regions: {
                      type: 'array',
                      items: {
                        type: 'string'
                      },
                      nullable: true
                    },
                    focal_species: {
                      type: 'array',
                      items: {
                        type: 'integer'
                      },
                      nullable: true
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
export function findSurveys(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'findSurveys' });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        req['system_user']['role_names']
      );

      const filterFields = parseQueryParams(req);

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const surveyService = new SurveyService(connection);

      const [surveys, surveysTotalCount] = await Promise.all([
        surveyService.findSurveys(
          isUserAdmin,
          systemUserId,
          filterFields,
          ensureCompletePaginationOptions(paginationOptions)
        ),
        surveyService.findSurveysCount(isUserAdmin, systemUserId, filterFields)
      ]);

      await connection.commit();

      const response = {
        surveys,
        pagination: makePaginationResponse(surveysTotalCount, paginationOptions)
      };

      // Allow browsers to cache this response for 30 seconds
      res.setHeader('Cache-Control', 'private, max-age=30');

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'findSurveys', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Parse the query parameters from the request into the expected format.
 *
 * @param {Request<unknown, unknown, unknown, ISurveyAdvancedFilters>} req
 * @return {*}  {ISurveyAdvancedFilters}
 */
function parseQueryParams(req: Request<unknown, unknown, unknown, ISurveyAdvancedFilters>): ISurveyAdvancedFilters {
  return {
    keyword: req.query.keyword ?? undefined,
    itis_tsns: req.query.itis_tsns ?? undefined,
    itis_tsn: (req.query.itis_tsn && Number(req.query.itis_tsn)) ?? undefined,
    start_date: req.query.start_date ?? undefined,
    end_date: req.query.end_date ?? undefined,
    survey_name: req.query.survey_name ?? undefined,
    system_user_id: req.query.system_user_id ?? undefined
  };
}
