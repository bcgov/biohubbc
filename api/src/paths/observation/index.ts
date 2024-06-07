import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IObservationAdvancedFilters } from '../../models/observation-view';
import { observervationsWithSubcountDataSchema } from '../../openapi/schemas/observation';
import { paginationRequestQueryParamSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { ObservationService } from '../../services/observation-service';
import { setCacheControl } from '../../utils/api-utils';
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
  description: "Gets a list of observations based on the user's permissions and search criteria.",
  tags: ['observations'],
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
 * Get observations for the current user, based on their permissions and search criteria.
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

      const observations = await observationService.findObservations(
        isUserAdmin,
        systemUserId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );

      const observationsTotalCount = await observationService.findObservationCount(
        isUserAdmin,
        systemUserId,
        filterFields
      );

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
      setCacheControl(res, 30);

      return res.status(200).json(response);
    } catch (error) {
      console.log(error);
      defaultLog.error({ label: 'getObservations', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

function parseQueryParams(req: Request): IObservationAdvancedFilters {
  return {
    keyword: req.query.keyword && String(req.query.keyword),
    minimum_count: req.query.minimum_count ? Number(req.query.minimum_count) : undefined,
    itis_tsns: req.query.itis_tsns ? String(req.query.itis_tsns).split(',').map(Number) : undefined,
    minimum_date: req.query.minimum_date && String(req.query.minimum_date),
    maximum_date: req.query.maximum_date && String(req.query.maximum_date),
    minimum_time: req.query.minimum_time && String(req.query.minimum_time),
    maximum_time: req.query.maximum_time && String(req.query.maximum_time)
  };
}
