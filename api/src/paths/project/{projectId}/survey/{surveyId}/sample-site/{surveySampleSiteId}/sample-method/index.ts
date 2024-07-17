import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../../errors/http-error';
import { InsertSampleMethodRecord } from '../../../../../../../../repositories/sample-method-repository';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { SampleLocationService } from '../../../../../../../../services/sample-location-service';
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
            additionalProperties: false,
            properties: {
              sampleMethods: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: [
                    'survey_sample_method_id',
                    'survey_sample_site_id',
                    'method_technique_id',
                    'method_response_metric_id',
                    'description',
                    'create_date',
                    'create_user',
                    'update_date',
                    'update_user',
                    'revision_count'
                  ],
                  properties: {
                    survey_sample_method_id: {
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
                    method_response_metric_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    description: {
                      type: 'string'
                    },
                    create_date: {
                      type: 'string'
                    },
                    create_user: {
                      type: 'integer',
                      minimum: 1
                    },
                    update_date: {
                      type: 'string',
                      nullable: true
                    },
                    update_user: {
                      type: 'integer',
                      minimum: 1,
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
          additionalProperties: false,
          properties: {
            sampleMethod: {
              type: 'object',
              additionalProperties: false,
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

    const surveyId = Number(req.params.surveyId);
    const surveySampleSiteId = Number(req.params.surveySampleSiteId);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const sampleSiteService = new SampleLocationService(connection);

      const sampleSite = sampleSiteService.getSurveySampleSiteById(surveyId, surveySampleSiteId);
      if (!sampleSite) {
        throw new HTTP400('The given sample site does not belong to the given survey');
      }

      const sampleMethod: InsertSampleMethodRecord = {
        ...req.body.sampleMethod,
        survey_sample_site_id: surveySampleSiteId
      };

      await connection.open();

      const sampleMethodService = new SampleMethodService(connection);

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
