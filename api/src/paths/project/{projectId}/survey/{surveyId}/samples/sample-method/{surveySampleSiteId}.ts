import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { PostSampleMethod } from '../../../../../../../repositories/sample-method-repository';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { SampleMethodService } from '../../../../../../../services/sample-method-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/samples/sample-site/{surveySampleMethodId}');

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
          projectId: Number(req.params.projectId),
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
          properties: {
            sampleMethod: {
              type: 'object',
              properties: {
                survey_sample_site_id: {
                  type: 'integer'
                },
                method_lookup_id: {
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
    200: {
      description: 'Updated sample method OK.'
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/401'
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
    if (!req.body.sampleMethod) {
      throw new HTTP400('Missing required body param `sampleMethod`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const sampleMethod: PostSampleMethod = req.body.sampleMethod;

      await connection.open();

      const sampleMethodService = new SampleMethodService(connection);

      const result = await sampleMethodService.updateSampleMethod(sampleMethod);

      await connection.commit();
      return res.status(200).send(result);
    } catch (error) {
      defaultLog.error({ label: 'updateSurveySampleMethod', message: 'error', error });
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
          projectId: Number(req.params.projectId),
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
    200: {
      description: 'Delete survey sample site OK'
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/401'
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

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const sampleMethodService = new SampleMethodService(connection);

      const result = await sampleMethodService.deleteSampleMethodRecord(surveySampleMethodId);

      await connection.commit();

      return res.status(200).send(result);
    } catch (error) {
      defaultLog.error({ label: 'deleteSurveySampleMethodRecord', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
