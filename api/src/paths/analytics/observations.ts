import { Operation } from 'express-openapi';
import { RequestHandler } from 'http-proxy-middleware';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { getObservationAnalyticsSchema } from '../../openapi/schemas/analytics';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { AnalyticsService } from '../../services/analytics-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/analytics/observations');

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
        },
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getObservationCountByGroup()
];

GET.apiDoc = {
  description: 'get analytics about observations for one or more surveys',
  tags: ['analytics'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'surveyIds',
      schema: {
        type: 'array',
        items: {
          type: 'integer',
          minimum: 1
        }
      },
      required: true,
      style: 'simple',
      explode: false
    },
    {
      in: 'query',
      name: 'groupByColumns',
      schema: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      required: true,
      style: 'simple',
      explode: false
    },
    {
      in: 'query',
      name: 'groupByQuantitativeMeasurements',
      schema: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      style: 'simple',
      explode: false
    },
    {
      in: 'query',
      name: 'groupByQualitativeMeasurements',
      schema: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      style: 'simple',
      explode: false
    }
  ],
  responses: {
    200: {
      description: 'Analytics calculated OK.',
      content: {
        'application/json': {
          schema: getObservationAnalyticsSchema
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

export function getObservationCountByGroup(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getObservationCountByGroup' });

    const { surveyIds, groupByColumns, groupByQuantitativeMeasurements, groupByQualitativeMeasurements } = req.query;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const analyticsService = new AnalyticsService(connection);

      const count = await analyticsService.getObservationCountByGroup(
        (surveyIds as string[]).map(Number),
        groupByColumns as string[],
        (groupByQuantitativeMeasurements as string[]) || [],
        (groupByQualitativeMeasurements as string[]) || []
      );

      await connection.commit();

      return res.status(200).json(count);
    } catch (error) {
      defaultLog.error({ label: 'getObservationCountByGroup', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
