import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../../errors/http-error';
import { InsertSampleMethodRecord } from '../../../../../../../../repositories/sample-method-repository';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { SampleMethodService } from '../../../../../../../../services/sample-method-service';
import { getLogger } from '../../../../../../../../utils/logger';

const defaultLog = getLogger(
  'paths/project/{projectId}/survey/{surveyId}/sample-site/{surveySampleSiteId}/sample-method/'
);

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
  getSurveySampleMethodRecords()
];

GET.apiDoc = {
  description: 'Get all survey sample methods.',
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
    }
  ],
  responses: {
    200: {
      description: 'List of survey sample sites.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              sampleMethods: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    survey_sample_method_id: {
                      type: 'integer'
                    },
                    survey_sample_site_id: {
                      type: 'integer'
                    },
                    method_lookup_id: {
                      type: 'integer'
                    },
                    description: {
                      type: 'string'
                    },
                    create_date: {
                      type: 'string'
                    },
                    create_user: {
                      type: 'integer'
                    },
                    update_date: {
                      type: 'string',
                      nullable: true
                    },
                    update_user: {
                      type: 'integer',
                      nullable: true
                    },
                    revision_count: {
                      type: 'integer'
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

/**
 * Get all survey sample sites.
 *
 * @returns {RequestHandler}
 */
export function getSurveySampleMethodRecords(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveySampleSiteId) {
      throw new HTTP400('Missing required param `surveySampleSiteId`');
    }

    const surveySampleSiteId = Number(req.params.surveySampleSiteId);
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req['keycloak_token']);

    try {

      await connection.open();

      const sampleMethodService = new SampleMethodService(connection);

      const result = await sampleMethodService.getSampleMethodsForSurveySampleSiteId(surveyId, surveySampleSiteId);

      await connection.commit();

      return res.status(200).json({ sampleMethods: result });
    } catch (error) {
      defaultLog.error({ label: 'getSurveySampleMethodRecords', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const POST: Operation = [
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
  createSurveySampleSiteRecord()
];

POST.apiDoc = {
  description: 'Insert new survey sample site record.',
  tags: ['project', 'survey'],
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
                methodName: {
                  type: 'string'
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
    201: {
      description: 'Sample Method added OK.'
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

export function createSurveySampleSiteRecord(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveySampleSiteId) {
      throw new HTTP400('Missing required param `surveySampleSiteId`');
    }

    if (!req.body.sampleMethod) {
      throw new HTTP400('Missing required body param `sampleMethod`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const sampleMethod: InsertSampleMethodRecord = req.body.sampleMethod;

      sampleMethod.survey_sample_site_id = Number(req.params.surveySampleSiteId);

      await connection.open();

      const sampleMethodService = new SampleMethodService(connection);

      // @TODO SIMSBIOHUB-494 audit
      await sampleMethodService.insertSampleMethod(sampleMethod);

      await connection.commit();

      return res.status(201).send();
    } catch (error) {
      defaultLog.error({ label: 'insertProjectParticipants', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
