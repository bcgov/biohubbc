import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { UpdateSamplePeriodObject } from '../../../../../../../../models/sample-period';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { SamplePeriodService } from '../../../../../../../../services/sample-period-service';
import { getLogger } from '../../../../../../../../utils/logger';

const defaultLog = getLogger(
  'paths/project/{projectId}/survey/{surveyId}/sample-site/sample-period/{surveySamplePeriodId}/index'
);

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
  getSamplePeriodById()
];

GET.apiDoc = {
  description: 'Gets a specific survey sample period',
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
        type: 'integer',
        minimum: 1,
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'sample_method_id',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
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
    }
  ],
  responses: {
    200: {
      description: 'Sample period response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: [
              'survey_sample_period_id',
              'survey_sample_method_id',
              'start_date',
              'end_date',
              'start_time',
              'end_time',
              'method_technique',
              'survey_sample_site'
            ],
            additionalProperties: false,
            properties: {
              survey_sample_period_id: {
                type: 'integer'
              },
              survey_sample_method_id: {
                type: 'integer'
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
                description: 'Details about the technique of the survey sample method',
                required: ['method_technique_id', 'name'],
                properties: {
                  method_technique_id: {
                    type: 'number',
                    description: 'Primary key of the method technique record'
                  },
                  name: {
                    type: 'string',
                    description: 'Name of the method technique'
                  },
                  description: {
                    type: 'string',
                    description: 'Description of the method technique'
                  }
                }
              },
              survey_sample_site: {
                type: 'object',
                description: 'Details about the site of the survey sample method',
                required: ['survey_sample_site_id', 'name'],
                properties: {
                  survey_sample_site_id: {
                    type: 'number',
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
 * Gets a survey sample period by its id
 *
 * @returns {RequestHandler}
 */
export function getSamplePeriodById(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getSamplePeriodById' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);
      const surveySamplePeriodId = Number(req.params.surveySamplePeriodId);

      const samplePeriodService = new SamplePeriodService(connection);
      const period = await samplePeriodService.getSamplePeriodById(surveyId, surveySamplePeriodId);

      await connection.commit();

      return res.status(200).json(period);
    } catch (error) {
      defaultLog.error({ label: 'getPeriods', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

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
  updateSamplePeriod()
];

PUT.apiDoc = {
  description: 'update survey sample period',
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
    {
      in: 'path',
      name: 'surveySamplePeriodId',
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
          required: ['method_technique_id', 'sample_period'],
          properties: {
            method_technique_id: {
              type: 'integer',
              description: 'Primary key of the period',
              nullable: true
            },
            survey_sample_site_id: {
              type: 'integer',
              description: 'Primary key of the sample site',
              nullable: true
            },
            sample_period: {
              type: 'object',
              required: ['start_date', 'end_date', 'survey_sample_period_id'],
              properties: {
                survey_sample_period_id: {
                  type: 'integer',
                  description: 'Primary key of the period',
                  nullable: true
                },
                survey_sample_method_id: {
                  type: 'integer',
                  description: 'Primary key of the method that the period belongs to',
                  nullable: true
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
  },
  responses: {
    204: {
      description: 'Survey Sample Period updated OK.'
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

export function updateSamplePeriod(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const connection = getDBConnection(req.keycloak_token);

    try {
      const samplePeriod = req.body as UpdateSamplePeriodObject;

      await connection.open();

      const samplePeriodService = new SamplePeriodService(connection);

      await samplePeriodService.updateSamplePeriod(surveyId, samplePeriod);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'updateSamplePeriod', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
