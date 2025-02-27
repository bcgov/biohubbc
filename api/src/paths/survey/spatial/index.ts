import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { ISurveyAdvancedFilters } from '../../../models/survey-view';
import { GeoJSONFeature } from '../../../openapi/schemas/geoJson';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../../request-handlers/security/authorization';
import { SurveyService } from '../../../services/survey-service';
import { getLogger } from '../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../utils/pagination';
import { getSystemUserFromRequest } from '../../../utils/request';

const defaultLog = getLogger('paths/survey/spatial');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  findSurveysSpatial()
];

GET.apiDoc = {
  description: 'Get survey spatial for a user id.',
  tags: ['survey'],
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
      name: 'survey_name',
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
      description: 'Surveys spatial response object for given user.',
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
                  title: 'Survey Get Spatial Response Object',
                  type: 'object',
                  additionalProperties: false,
                  required: ['project_id', 'survey_id', 'survey_location_id', 'geojson'],
                  properties: {
                    project_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    survey_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    survey_location_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    geojson: { type: 'array', items: { ...(GeoJSONFeature as object) } }
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
 * Get all project geometries (potentially based on filter criteria).
 *
 * @returns {RequestHandler}
 */
export function findSurveysSpatial(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'findSurveysSpatial' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const systemUser = getSystemUserFromRequest(req);

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        systemUser.role_names
      );

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const filterFields = parseQueryParams(req);

      const surveyService = new SurveyService(connection);

      const [surveySpatial, surveysTotalCount] = await Promise.all([
        surveyService.findSurveysSpatial(
          isUserAdmin,
          systemUserId,
          filterFields,
          ensureCompletePaginationOptions(paginationOptions)
        ),
        surveyService.findSurveysCount(isUserAdmin, systemUserId, filterFields)
      ]);

      await connection.commit();

      const response = {
        surveys: surveySpatial,
        pagination: makePaginationResponse(surveysTotalCount, paginationOptions)
      };

      // Allow browsers to cache this response for 30 seconds
      res.setHeader('Cache-Control', 'private, max-age=5');

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'findSurveysSpatial', message: 'error', error });
      await connection.rollback();
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
    survey_name: req.query.survey_name ?? undefined,
    project_name: req.query.project_name ?? undefined,
    system_user_id: (req.query.system_user_id && Number(req.query.system_user_id)) ?? undefined
  };
}
