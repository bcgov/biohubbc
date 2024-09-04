import { Operation } from 'express-openapi';
import { RequestHandler } from 'http-proxy-middleware';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
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
      required: true
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
      required: true
    },
    {
      in: 'query',
      name: 'groupByQuantitativeMeasurements',
      schema: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    },
    {
      in: 'query',
      name: 'groupByQualitativeMeasurements',
      schema: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
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
              required: [
                'id',
                'row_count',
                'individual_count',
                'individual_percentage',
                'quantitative_measurements',
                'qualitative_measurements'
              ],
              // Additional properties is intentionally true to allow for dynamic key-value measurement pairs
              additionalProperties: true,
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  description: 'Unique identifier for the group. Will not be consistent between requests.'
                },
                row_count: {
                  type: 'number',
                  description: 'Number of rows in the group'
                },
                individual_count: {
                  type: 'number',
                  description: 'Sum of subcount values across all rows in the group'
                },
                individual_percentage: {
                  type: 'number',
                  description:
                    'Sum of subcount values across the group divided by the sum of subcount values across all observations in the specified surveys'
                },
                quantitative_measurements: {
                  type: 'array',
                  items: {
                    type: 'object',
                    description: 'Quantitative measurement groupings',
                    required: ['taxon_measurement_id', 'measurement_name', 'value'],
                    additionalProperties: false,
                    properties: {
                      taxon_measurement_id: {
                        type: 'string',
                        format: 'uuid'
                      },
                      measurement_name: {
                        type: 'string'
                      },
                      value: {
                        type: 'number',
                        nullable: true
                      }
                    }
                  }
                },
                qualitative_measurements: {
                  type: 'array',
                  items: {
                    type: 'object',
                    description: 'Qualitative measurement groupings',
                    required: ['taxon_measurement_id', 'measurement_name', 'option'],
                    additionalProperties: false,
                    properties: {
                      taxon_measurement_id: {
                        type: 'string',
                        format: 'uuid'
                      },
                      measurement_name: {
                        type: 'string'
                      },
                      option: {
                        type: 'object',
                        required: ['option_id', 'option_label'],
                        additionalProperties: false,
                        properties: {
                          option_id: {
                            type: 'string',
                            format: 'uuid',
                            nullable: true
                          },
                          option_label: {
                            type: 'string',
                            nullable: true
                          }
                        }
                      }
                    }
                  }
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
  return async (req, res) => {
    defaultLog.debug({ label: 'getObservationCountByGroup' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      const { surveyIds, groupByColumns, groupByQuantitativeMeasurements, groupByQualitativeMeasurements } = req.query;

      await connection.open();

      const analyticsService = new AnalyticsService(connection);

      const response = await analyticsService.getObservationCountByGroup(
        (surveyIds as string[]).map(Number),
        groupByColumns as string[],
        (groupByQuantitativeMeasurements as string[]) || [],
        (groupByQualitativeMeasurements as string[]) || []
      );

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getObservationCountByGroup', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
