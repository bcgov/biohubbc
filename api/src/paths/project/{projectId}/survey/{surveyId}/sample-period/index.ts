import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import {
  paginationRequestQueryParamSchema,
  paginationResponseSchema
} from '../../../../../../openapi/schemas/pagination';
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
              items: {
                type: 'object',
                required: [
                  'method_technique_id',
                  'survey_sample_site_id',
                  'start_date',
                  'start_time',
                  'end_date',
                  'end_time'
                ],
                additionalProperties: false,
                properties: {
                  survey_sample_site_id: {
                    type: 'integer',
                    minimum: 1,
                    description: 'Primary key of a sampling site.'
                  },
                  method_technique_id: {
                    type: 'integer',
                    minimum: 1,
                    description: 'Primary key of a method technique.'
                  },
                  start_date: {
                    type: 'string',
                    description: 'Start date of the period'
                  },
                  start_time: {
                    type: 'string',
                    description: 'Start time of the period',
                    nullable: true
                  },
                  end_date: {
                    type: 'string',
                    description: 'End date of the period'
                  },
                  end_time: {
                    type: 'string',
                    description: 'End time of the period',
                    nullable: true
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
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: [
                    'survey_sample_period_id',
                    'survey_sample_site_id',
                    'method_technique_id',
                    'start_date',
                    'end_date',
                    'start_time',
                    'end_time',
                    'method_technique',
                    'survey_sample_site'
                  ],
                  properties: {
                    survey_sample_period_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    survey_sample_site_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    method_technique_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    start_date: {
                      type: 'string'
                    },
                    end_date: {
                      type: 'string'
                    },
                    start_time: {
                      type: 'string',
                      nullable: true
                    },
                    end_time: {
                      type: 'string',
                      nullable: true
                    },
                    method_technique: {
                      type: 'object',
                      description: 'Details about the technique of the survey sample period',
                      required: ['method_technique_id', 'name', 'description', 'method_response_metric_id'],
                      properties: {
                        method_technique_id: {
                          type: 'integer',
                          minimum: 1,
                          description: 'Primary key of the method technique record'
                        },
                        name: {
                          type: 'string',
                          description: 'Name of the method technique'
                        },
                        description: {
                          type: 'string',
                          description: 'Description of the method technique',
                          nullable: true
                        },
                        method_response_metric_id: {
                          type: 'integer',
                          minimum: 1
                        }
                      }
                    },
                    survey_sample_site: {
                      type: 'object',
                      description: 'Details about the site of the survey sample period',
                      required: ['survey_sample_site_id', 'name'],
                      properties: {
                        survey_sample_site_id: {
                          type: 'integer',
                          minimum: 1,
                          description: 'Primary key of the site record'
                        },
                        name: {
                          type: 'string',
                          description: 'Name of the site'
                        }
                      }
                    }
                  }
                }
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
        samplePeriodService.getSamplePeriodsForSurvey(surveyId, {
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
      defaultLog.error({ label: 'getSurveySampleLocationRecord', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
