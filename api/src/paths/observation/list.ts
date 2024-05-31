import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IObservationAdvancedFilters } from '../../models/observation-view';
import { observervationsWithSubcountDataSchema } from '../../openapi/schemas/observation';
import { paginationRequestQueryParamSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { ObservationService } from '../../services/observation-service';
import { getLogger } from '../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../utils/pagination';

const defaultLog = getLogger('paths/observation');

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
  getObservationsForUserId()
];

GET.apiDoc = {
  description: 'Gets a list of observations based on search parameters if passed in.',
  tags: ['observations'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [...paginationRequestQueryParamSchema],
  requestBody: {
    description: 'Observation list search filter criteria object.',
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
      description: 'Observation response object.',
      content: {
        'application/json': {
          schema: observervationsWithSubcountDataSchema
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
 * Get all observations (potentially based on filter criteria).
 *
 * @returns {RequestHandler}
 */
export function getObservationsForUserId(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getObservationsForUserId' });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        req['system_user']['role_names']
      );
      const systemUserId = connection.systemUserId();
      const filterFields: IObservationAdvancedFilters = {
        keyword: req.query.keyword && String(req.query.keyword),
        minimum_count: req.query.minimum_count ? Number(req.query.minimum_count) : undefined,
        itis_tsns: req.query.itis_tsns ? String(req.query.itis_tsns).split(',').map(Number) : undefined,
        minimum_date: req.query.minimum_date && String(req.query.minimum_date),
        maximum_date: req.query.maximum_date && String(req.query.maximum_date),
        minimum_time: req.query.minimum_time && String(req.query.minimum_time),
        maximum_time: req.query.maximum_time && String(req.query.maximum_time),
        system_user_id: req.query.system_user_id && String(req.query.system_user_id)
      };

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const observationService = new ObservationService(connection);
      const observations = await observationService.getObservationsForUserId(
        isUserAdmin,
        systemUserId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );

      const observationsTotalCount = await observationService.getSurveyObservationCountByUserId(
        isUserAdmin,
        systemUserId,
        filterFields
      );

      const response = {
        ...observations,
        pagination: makePaginationResponse(observationsTotalCount, paginationOptions)
      };

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getObservationsForUserId', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
