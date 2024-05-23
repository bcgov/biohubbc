import { Operation } from 'express-openapi';
import { RequestHandler } from 'http-proxy-middleware';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/http-error';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { AnalyticsService } from '../../services/analytics-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/analytics/observations');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      or: [
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
      style: 'simple', // Indicates comma separated values
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
      style: 'simple', // Indicates comma separated values
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
      style: 'simple', // Indicates comma separated values
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
      style: 'simple', // Indicates comma separated values
      explode: false
    }
  ],
  responses: {
    200: {
      description: 'Analytics calculated OK.',
      content: {
        'application/json': {
          schema: {
            title: 'Observation analytics response object',
            type: 'array',
            items: {
              type: 'object',
              required: ['count'],
              properties: {
                count: {
                  type: 'number'
                }
              }
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

export function getObservationCountByGroup(): RequestHandler {
  defaultLog.debug({ label: 'getObservationCountByGroup' });

  return async (req, res) => {
    res.setHeader('Cache-Control', 'max-age=180');

    if (!req.query.surveyIds) {
      throw new HTTP400('Missing required param `surveyIds`');
    }

    if (!Array.isArray(req.query.surveyIds)) {
      throw new HTTP400('Param `surveyIds` is not an array, as required');
    }

    if (!req.query.groupByColumns) {
      throw new HTTP400('Missing required param `groupByColumns`');
    }

    if (!Array.isArray(req.query.groupByColumns)) {
      throw new HTTP400('Param `groupByColumns` is not an array, as required');
    }

    if (req.query.groupByQualitativeMeasurements) {
      if (!Array.isArray(req.query.groupByQualitativeMeasurements)) {
        throw new HTTP400('Param `groupByQualitativeMeasurements` is not an array, as required');
      }
    }

    if (req.query.groupByQuantitativeMeasurements) {
      if (!Array.isArray(req.query.groupByQuantitativeMeasurements)) {
        throw new HTTP400('Param `groupByQuantitativeMeasurements` is not an array, as required');
      }
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const surveyIds = req.query.surveyIds.map((id) => Number(id));
      const groupByColumns = Array.isArray(req.query.groupByColumns)
        ? req.query.groupByColumns.map((id) => String(id)).filter((id) => id && id.trim() !== '')
        : [];
      const groupByQualitativeMeasurements = Array.isArray(req.query.groupByQualitativeMeasurements)
        ? req.query.groupByQualitativeMeasurements.map((id) => String(id)).filter((id) => id && id.trim() !== '')
        : [];
      const groupByQuantitativeMeasurements = Array.isArray(req.query.groupByQuantitativeMeasurements)
        ? req.query.groupByQuantitativeMeasurements.map((id) => String(id)).filter((id) => id && id.trim() !== '')
        : [];

      await connection.open();

      const analyticsService = new AnalyticsService(connection);

      const count = await analyticsService.getObservationCountByGroup(
        surveyIds,
        groupByColumns,
        groupByQuantitativeMeasurements,
        groupByQualitativeMeasurements
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
