import { Request, RequestHandler } from 'express';
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

const defaultLog = getLogger('paths/observation/index');

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
  getObservations()
];

GET.apiDoc = {
  description: "Gets a list of observations based on the user's permissions and filter criteria.",
  tags: ['observations'],
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
      description: 'ISO 8601 date string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'end_date',
      description: 'ISO 8601 date string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'start_time',
      description: 'ISO 8601 time string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'end_time',
      description: 'ISO 8601 time string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'min_count',
      description: 'Minimum observation count (inclusive).',
      required: false,
      schema: {
        type: 'number',
        minimum: 0,
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
 * Get observations for the current user, based on their permissions and filter criteria.
 *
 * @returns {RequestHandler}
 */
export function getObservations(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getObservations' });

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

      const observationService = new ObservationService(connection);

      const [observations, observationsTotalCount] = await Promise.all([
        observationService.findObservations(
          isUserAdmin,
          systemUserId,
          filterFields,
          ensureCompletePaginationOptions(paginationOptions)
        ),
        observationService.findObservationsCount(isUserAdmin, systemUserId, filterFields)
      ]);

      await connection.commit();

      const response = {
        surveyObservations: observations,
        supplementaryObservationData: {
          observationCount: observationsTotalCount,
          qualitative_measurements: [],
          quantitative_measurements: [],
          qualitative_environments: [],
          quantitative_environments: []
        },
        pagination: makePaginationResponse(observationsTotalCount, paginationOptions)
      };

      // Allow browsers to cache this response for 30 seconds
      res.setHeader('Cache-Control', 'private, max-age=30');

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getObservations', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Parse the query parameters from the request into the expected format.
 *
 * @param {Request<unknown, unknown, unknown, IObservationAdvancedFilters>} req
 * @return {*}  {IObservationAdvancedFilters}
 */
function parseQueryParams(
  req: Request<unknown, unknown, unknown, IObservationAdvancedFilters>
): IObservationAdvancedFilters {
  return {
    keyword: req.query.keyword ?? undefined,
    itis_tsns: req.query.itis_tsns ?? undefined,
    itis_tsn: (req.query.itis_tsn && Number(req.query.itis_tsn)) ?? undefined,
    start_date: req.query.start_date ?? undefined,
    end_date: req.query.end_date ?? undefined,
    start_time: req.query.start_time ?? undefined,
    end_time: req.query.end_time ?? undefined,
    min_count: (req.query.min_count && Number(req.query.min_count)) ?? undefined,
    system_user_id: req.query.system_user_id ?? undefined
  };
}
