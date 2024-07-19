import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../../../../errors/http-error';
import { UpdateSamplePeriodRecord } from '../../../../../../../../../../repositories/sample-period-repository';
import { authorizeRequestHandler } from '../../../../../../../../../../request-handlers/security/authorization';
import { SamplePeriodService } from '../../../../../../../../../../services/sample-period-service';
import { getLogger } from '../../../../../../../../../../utils/logger';

const defaultLog = getLogger(
  'paths/project/{projectId}/survey/{surveyId}/sample-site/{surveySampleSiteId}/sample-method/{surveySampleMethodId}/sample-period/{surveySamplePeriodId}'
);

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
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
  updateSurveySamplePeriod()
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
      name: 'surveySampleSiteId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveySampleMethodId',
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
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            samplePeriod: {
              type: 'object',
              additionalProperties: false,
              properties: {
                start_date: {
                  type: 'string'
                },
                end_date: {
                  type: 'string'
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

export function updateSurveySamplePeriod(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveySampleMethodId) {
      throw new HTTP400('Missing required param `surveySampleMethodId`');
    }

    if (!req.params.surveySamplePeriodId) {
      throw new HTTP400('Missing required param `surveySamplePeriodId`');
    }

    if (!req.body.samplePeriod) {
      throw new HTTP400('Missing required body param `samplePeriod`');
    }

    const surveyId = Number(req.params.surveyId);
    const connection = getDBConnection(req.keycloak_token);

    try {
      const samplePeriod: UpdateSamplePeriodRecord = {
        ...req.body.samplePeriod,
        survey_sample_method_id: Number(req.params.surveySampleMethodId),
        survey_sample_period_id: Number(req.params.surveySamplePeriodId)
      };

      await connection.open();

      const samplePeriodService = new SamplePeriodService(connection);

      await samplePeriodService.updateSamplePeriod(surveyId, samplePeriod);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'updateSurveySamplePeriod', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
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
  deleteSurveySamplePeriodRecord()
];

DELETE.apiDoc = {
  description: 'Delete a survey sample period record.',
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
      name: 'surveySampleSiteId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveySampleMethodId',
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
  responses: {
    204: {
      description: 'Delete survey sample site OK'
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

export function deleteSurveySamplePeriodRecord(): RequestHandler {
  return async (req, res) => {
    const surveySamplePeriodId = Number(req.params.surveySamplePeriodId);
    const surveyId = Number(req.params.surveyId);

    if (!surveySamplePeriodId) {
      throw new HTTP400('Missing required param `surveySamplePeriodId`');
    }

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const samplePeriodService = new SamplePeriodService(connection);

      await samplePeriodService.deleteSamplePeriodRecord(surveyId, surveySamplePeriodId);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteSurveySamplePeriodRecord', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
