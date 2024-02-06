import { SchemaObject } from 'ajv';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { InsertObservation, UpdateObservation } from '../../../../../../repositories/observation-repository';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../services/observation-service';
import { getLogger } from '../../../../../../utils/logger';
import { ApiPaginationOptions } from '../../../../../../zod-schema/pagination';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation');

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
  getSurveyObservations()
];

export const PUT: Operation = [
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
  insertUpdateSurveyObservations()
];

export const surveyObservationsSupplementaryData: SchemaObject = {
  type: 'object',
  required: ['observationCount'],
  properties: {
    observationCount: {
      type: 'integer',
      minimum: 0
    }
  }
};

export const surveyObservationsResponseSchema: SchemaObject = {
  type: 'object',
  nullable: true,
  required: ['surveyObservations'],
  properties: {
    surveyObservations: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          'survey_observation_id',
          'wldtaxonomic_units_id',
          'latitude',
          'longitude',
          'count',
          'observation_date',
          'observation_time',
          'create_user',
          'create_date',
          'update_user',
          'update_date',
          'revision_count'
        ],
        properties: {
          survey_observation_id: {
            type: 'integer'
          },
          wldtaxonomic_units_id: {
            type: 'integer'
          },
          latitude: {
            type: 'number'
          },
          longitude: {
            type: 'number'
          },
          count: {
            type: 'integer'
          },
          observation_date: {
            type: 'string'
          },
          observation_time: {
            type: 'string'
          },
          create_date: {
            oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
            description: 'ISO 8601 date string for the project start date'
          },
          create_user: {
            type: 'integer',
            minimum: 1
          },
          update_date: {
            oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
            description: 'ISO 8601 date string for the project start date',
            nullable: true
          },
          update_user: {
            type: 'integer',
            minimum: 1,
            nullable: true
          },
          revision_count: {
            type: 'integer',
            minimum: 0
          }
        }
      }
    }
  }
};

const paginationResponseSchema: SchemaObject = {
  type: 'object',
  required: ['total', 'current_page', 'last_page'],
  properties: {
    total: {
      type: 'integer',
      description: 'The total number of observation records belonging to the survey'
    },
    per_page: {
      type: 'integer',
      minimum: 1,
      description: 'The number of records shown per page'
    },
    current_page: {
      type: 'integer',
      description: 'The current page being fetched'
    },
    last_page: {
      type: 'integer',
      minimum: 1,
      description: 'The total number of pages'
    },
    sort: {
      type: 'string',
      description: 'The column that is being sorted on'
    },
    order: {
      type: 'string',
      enum: ['asc', 'desc'],
      description: 'The sort order of the response'
    }
  }
};

GET.apiDoc = {
  description: 'Get all observations for the survey.',
  tags: ['observation'],
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
    {
      in: 'query',
      name: 'page',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
        description: 'The current page number being fetched'
      }
    },
    {
      in: 'query',
      name: 'limit',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        description: 'The number of records per page'
      }
    },
    {
      in: 'query',
      name: 'sort',
      required: false,
      description: 'The column being sorted on'
    },
    {
      in: 'query',
      name: 'order',
      required: false,
      description: 'The order of the sort, i.e. asc or desc'
    }
  ],
  responses: {
    200: {
      description: 'Survey Observations get response.',
      content: {
        'application/json': {
          schema: {
            ...surveyObservationsResponseSchema,
            required: ['surveyObservations', 'supplementaryObservationData', 'pagination'],
            properties: {
              ...surveyObservationsResponseSchema.properties,
              supplementaryObservationData: { ...surveyObservationsSupplementaryData },
              pagination: { ...paginationResponseSchema }
            },
            title: 'Survey get response object, for view purposes'
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

PUT.apiDoc = {
  description: 'Insert/update/delete observations for the survey.',
  tags: ['observation'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      required: true
    }
  ],
  requestBody: {
    description: 'Survey observation record data',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            surveyObservations: {
              description: 'Survey observation records.',
              type: 'array',
              items: {
                type: 'object',
                required: [
                  'wldtaxonomic_units_id',
                  'count',
                  'latitude',
                  'longitude',
                  'observation_date',
                  'observation_time'
                ],
                properties: {
                  wldtaxonomic_units_id: {
                    oneOf: [{ type: 'integer' }, { type: 'string' }]
                  },
                  count: {
                    type: 'integer'
                  },
                  latitude: {
                    type: 'number'
                  },
                  longitude: {
                    type: 'number'
                  },
                  observation_date: {
                    type: 'string'
                  },
                  observation_time: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Update OK',
      content: {
        'application/json': {
          schema: { ...surveyObservationsResponseSchema }
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
 * This record maps observation table sampling site site ID columns to sampling data
 * columns that can be sorted on.
 *
 * TODO We should probably modify frontend functionality to make requests to sort on these
 * columns.
 */
const samplingSiteSortingColumnName: Record<string, string> = {
  survey_sample_site_id: 'survey_sample_site_name',
  survey_sample_method_id: 'survey_sample_method_name',
  survey_sample_period_id: 'survey_sample_period_start_datetime'
};

/**
 * Fetch all observations for a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getSurveyObservations(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const page: number | undefined = req.query.page ? Number(req.query.page) : undefined;
    const limit: number | undefined = req.query.limit ? Number(req.query.limit) : undefined;
    const order: 'asc' | 'desc' | undefined = req.query.order ? (String(req.query.order) as 'asc' | 'desc') : undefined;

    const sortQuery: string | undefined = req.query.sort ? String(req.query.sort) : undefined;
    let sort = sortQuery;

    if (sortQuery && samplingSiteSortingColumnName[sortQuery]) {
      sort = samplingSiteSortingColumnName[sortQuery];
    }

    defaultLog.debug({ label: 'getSurveyObservations', surveyId });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const paginationOptions: ApiPaginationOptions | undefined =
        limit !== undefined && page !== undefined ? { limit, page, sort, order } : undefined;

      const observationData = await observationService.getSurveyObservationsWithSupplementaryAndSamplingData(
        surveyId,
        paginationOptions
      );
      const { observationCount } = observationData.supplementaryObservationData;

      return res.status(200).json({
        ...observationData,
        pagination: {
          total: observationCount,
          per_page: limit,
          current_page: page ?? 1,
          last_page: Math.max(1, Math.ceil(observationCount / (limit ?? 1))),
          sort,
          order
        }
      });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Inserts new observation records.
 * Updates existing observation records.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function insertUpdateSurveyObservations(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'insertUpdateSurveyObservations', surveyId });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      // Sanitize all incoming records
      const records: (InsertObservation | UpdateObservation)[] = req.body.surveyObservations.map((record: any) => {
        return {
          survey_observation_id: record.survey_observation_id,
          wldtaxonomic_units_id: Number(record.wldtaxonomic_units_id),
          survey_sample_site_id: record.survey_sample_site_id,
          survey_sample_method_id: record.survey_sample_method_id,
          survey_sample_period_id: record.survey_sample_period_id,
          latitude: record.latitude,
          longitude: record.longitude,
          count: record.count,
          observation_date: record.observation_date,
          observation_time: record.observation_time
        } as InsertObservation | UpdateObservation;
      });

      const surveyObservations = await observationService.insertUpdateSurveyObservations(surveyId, records);

      await connection.commit();

      return res.status(200).json({ surveyObservations });
    } catch (error) {
      defaultLog.error({ label: 'insertUpdateSurveyObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
