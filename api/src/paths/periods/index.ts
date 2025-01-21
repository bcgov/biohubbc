import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IPeriodAdvancedFilters } from '../../models/period-view';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../openapi/schemas/pagination';
import { GetPeriodResponseSchema } from '../../openapi/schemas/period';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { SamplePeriodService } from '../../services/sample-period-service';
import { getLogger } from '../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../utils/pagination';
import { getSystemUserFromRequest } from '../../utils/request';

const defaultLog = getLogger('paths/periods/index');

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
  findPeriods()
];

GET.apiDoc = {
  description: "Gets a list of periods based on the user's permissions and filter criteria.",
  tags: ['periods'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'survey_id',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'sample_site_id',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'integer',
          minimum: 1
        },
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'method_technique_id',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'integer',
          minimum: 1
        },
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
      description: 'periods response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['periods', 'pagination'],
            additionalProperties: false,
            properties: {
              periods: {
                type: 'array',
                items: GetPeriodResponseSchema
              },
              pagination: paginationResponseSchema
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
 * Get periods for the current user, based on their permissions and filter criteria.
 *
 * @returns {RequestHandler}
 */
export function findPeriods(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'findPeriods' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const systemUser = getSystemUserFromRequest(req);

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        systemUser.role_names
      );

      const filterFields = parseQueryParams(req);

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const samplePeriodService = new SamplePeriodService(connection);

      const [periods, periodsCount] = await Promise.all([
        samplePeriodService.findSamplePeriods(
          isUserAdmin,
          systemUserId,
          filterFields,
          ensureCompletePaginationOptions(paginationOptions)
        ),
        samplePeriodService.findSamplePeriodsCount(isUserAdmin, systemUserId, filterFields)
      ]);

      await connection.commit();

      const response = {
        periods: periods,
        pagination: makePaginationResponse(periodsCount, paginationOptions)
      };

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getPeriods', message: 'error', error });
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
 * @param {Request<unknown, unknown, unknown, IPeriodAdvancedFilters>} req
 * @return {*}  {IPeriodAdvancedFilters}
 */
function parseQueryParams(req: Request<unknown, unknown, unknown, IPeriodAdvancedFilters>): IPeriodAdvancedFilters {
  return {
    survey_id: (req.query.survey_id && Number(req.query.survey_id)) ?? undefined,
    sample_site_id: (req.query.sample_site_id && req.query.sample_site_id.map(Number)) ?? [],
    method_technique_id: (req.query.method_technique_id && req.query.method_technique_id.map(Number)) ?? [],
    system_user_id: (req.query.system_user_id && Number(req.query.system_user_id)) ?? undefined
  };
}
