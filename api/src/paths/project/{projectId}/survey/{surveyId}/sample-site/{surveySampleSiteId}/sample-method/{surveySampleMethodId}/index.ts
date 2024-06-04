import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../../../errors/http-error';
import { UpdateSampleMethodRecord } from '../../../../../../../../../repositories/sample-method-repository';
import { authorizeRequestHandler } from '../../../../../../../../../request-handlers/security/authorization';
import { SampleMethodService } from '../../../../../../../../../services/sample-method-service';
import { getLogger } from '../../../../../../../../../utils/logger';

const defaultLog = getLogger(
  'paths/project/{projectId}/survey/{surveyId}/sample-site/{surveySampleSiteId}/sample-method/{surveySampleMethodId}'
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
  updateSurveySampleMethod()
];

PUT.apiDoc = {
  description: 'update survey sample method',
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
      name: 'surveySampleMethodId',
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
            sampleMethod: {
              type: 'object',
              additionalProperties: false,
              properties: {
                method_technique_id: {
                  type: 'integer'
                },
                description: {
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
      description: 'Updated sample method OK.'
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

export function updateSurveySampleMethod(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveySampleSiteId) {
      throw new HTTP400('Missing required param `surveySampleSiteId`');
    }

    if (!req.params.surveySampleMethodId) {
      throw new HTTP400('Missing required param `surveySampleMethodId`');
    }

    if (!req.body.sampleMethod) {
      throw new HTTP400('Missing required body param `sampleMethod`');
    }

    const surveyId = Number(req.params.surveyId);
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const sampleMethod: UpdateSampleMethodRecord = {
        ...req.body.sampleMethod,
        survey_sample_site_id: Number(req.params.surveySampleSiteId),
        survey_sample_method_id: Number(req.params.surveySampleMethodId)
      };

      await connection.open();

      const sampleMethodService = new SampleMethodService(connection);

      await sampleMethodService.updateSampleMethod(surveyId, sampleMethod);

      await connection.commit();
      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'updateSurveySampleMethod', message: 'error', error });
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
  deleteSurveySampleMethodRecord()
];

DELETE.apiDoc = {
  description: 'Delete a survey sample method record.',
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
      name: 'surveySampleMethodId',
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

export function deleteSurveySampleMethodRecord(): RequestHandler {
  return async (req, res) => {
    const surveySampleMethodId = Number(req.params.surveySampleMethodId);

    if (!surveySampleMethodId) {
      throw new HTTP400('Missing required param `surveySampleMethodId`');
    }

    const surveyId = Number(req.params.surveyId);
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const sampleMethodService = new SampleMethodService(connection);

      await sampleMethodService.deleteSampleMethodRecord(surveyId, surveySampleMethodId);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteSurveySampleMethodRecord', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
