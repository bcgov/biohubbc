import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import {
  paginationRequestQueryParamSchema,
  paginationResponseSchema
} from '../../../../../../openapi/schemas/pagination';
import { CreatePeriodRequestSchema, GetPeriodResponseSchema } from '../../../../../../openapi/schemas/period';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { SamplePeriodService } from '../../../../../../services/sample-period-service';
import { getLogger } from '../../../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../../../utils/pagination';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/sample-period');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  postSamplePeriods()
];

POST.apiDoc = {
  description: 'Create survey sample period records.',
  tags: ['periods'],
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
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['sample_periods'],
          properties: {
            sample_periods: {
              type: 'array',
              items: CreatePeriodRequestSchema
            }
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Sample periods created OK.'
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

export function postSamplePeriods(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      const surveyId = Number(req.params.surveyId);
      const periods = req.body.sample_periods;

      await connection.open();

      const samplePeriodService = new SamplePeriodService(connection);
      await samplePeriodService.insertSamplePeriods(surveyId, periods);

      await connection.commit();

      return res.status(201).send();
    } catch (error) {
      defaultLog.error({ label: 'postSamplePeriods', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

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
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveySamplePeriods()
];

GET.apiDoc = {
  description: 'Get survey sample periods.',
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
    {
      in: 'path',
      name: 'surveyId',
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
      description: 'List of survey sample periods.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              periods: {
                type: 'array',
                items: GetPeriodResponseSchema
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
 * Get all survey sample sites, paginated or filtered by keyword.
 *
 * @returns {RequestHandler}
 */
export function getSurveySamplePeriods(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      const surveyId = Number(req.params.surveyId);

      const paginationOptions = makePaginationOptionsFromRequest(req);

      await connection.open();

      const samplePeriodService = new SamplePeriodService(connection);

      const [periods, samplePeriodsCount] = await Promise.all([
        samplePeriodService.getSamplePeriodsForSurveys([surveyId], {
          pagination: ensureCompletePaginationOptions(paginationOptions)
        }),
        samplePeriodService.getSamplePeriodsCountForSurvey(surveyId)
      ]);

      await connection.commit();

      return res.status(200).json({
        periods,
        pagination: makePaginationResponse(samplePeriodsCount, paginationOptions)
      });
    } catch (error) {
      defaultLog.error({ label: 'getSurveySamplePeriods', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
