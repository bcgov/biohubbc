import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { COLLECTION_ROLE, SURVEY_ROLE, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IObservationAnalyticsFilters } from '../../models/analytics-view';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { AnalyticsService } from '../../services/analytics-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/analytics/observations');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR, SURVEY_ROLE.VIEWER],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validCollectionRoles: [COLLECTION_ROLE.ADMIN, COLLECTION_ROLE.MEMBER],
          collectionId: Number(req.params.surveyId),
          discriminator: 'CollectionRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getObservationCountByGroup()
];

GET.apiDoc = {
  description: 'Get analytics about observations for one or more surveys.',
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
          type: 'string',
          enum: [
            'survey_sample_site_id',
            'method_technique_id',
            'survey_sample_period_id',
            'itis_tsn',
            'observation_date'
          ]
        }
      },
      description: 'An array of column names to group the observations data by'
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
      description: 'An array of quantitative taxon_measurement_ids to group the observations data by'
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
      description: 'An array of qualitative taxon_measurement_ids to group the observations data by'
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
              // Additional properties is intentionally true to allow for dynamic key-value measurement pairs and
              // dynamic columns based on the groupByColumns query parameter
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
      await connection.open();

      const filterFields = parseQueryParams(req);

      const analyticsService = new AnalyticsService(connection);

      const response = await analyticsService.getObservationCountByGroup(
        filterFields.surveyIds,
        filterFields.groupByColumns,
        filterFields.groupByQuantitativeMeasurements,
        filterFields.groupByQualitativeMeasurements
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

/**
 * Parse the query parameters from the request into the expected format.
 *
 * @param {Request<unknown, unknown, unknown, Partial<IObservationAnalyticsFilters>>} req
 * @return {*}  {IObservationAnalyticsFilters}
 */
function parseQueryParams(
  req: Request<unknown, unknown, unknown, Partial<IObservationAnalyticsFilters>>
): IObservationAnalyticsFilters {
  return {
    surveyIds: (req.query.surveyIds && req.query.surveyIds.map(Number)) ?? [],
    groupByColumns: req.query.groupByColumns ?? [],
    groupByQuantitativeMeasurements: req.query.groupByQuantitativeMeasurements ?? [],
    groupByQualitativeMeasurements: req.query.groupByQualitativeMeasurements ?? []
  };
}
