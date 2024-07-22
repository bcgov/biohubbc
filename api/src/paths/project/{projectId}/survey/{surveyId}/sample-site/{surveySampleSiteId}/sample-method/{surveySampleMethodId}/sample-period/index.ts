import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../../../../errors/http-error';
import { InsertSamplePeriodRecord } from '../../../../../../../../../../repositories/sample-period-repository';
import { authorizeRequestHandler } from '../../../../../../../../../../request-handlers/security/authorization';
import { SamplePeriodService } from '../../../../../../../../../../services/sample-period-service';
import { getLogger } from '../../../../../../../../../../utils/logger';

const defaultLog = getLogger(
  'paths/project/{projectId}/survey/{surveyId}/sample-site/{surveySampleSiteId}/sample-method/{surveySampleMethodId}/sample-period/'
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
  getSurveySamplePeriodRecords()
];

GET.apiDoc = {
  description: 'Get all survey sample periods.',
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
    }
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
              samplePeriods: {
                type: 'array',
                items: {
                  type: 'object',
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
 * Get all survey sample periods.
 *
 * @returns {RequestHandler}
 */
export function getSurveySamplePeriodRecords(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveySampleMethodId) {
      throw new HTTP400('Missing required path param `surveySampleMethodId`');
    }

    const surveyId = Number(req.params.surveyId);
    const surveySampleMethodId = Number(req.params.surveySampleMethodId);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const samplePeriodService = new SamplePeriodService(connection);

      const result = await samplePeriodService.getSamplePeriodsForSurveyMethodId(surveyId, surveySampleMethodId);

      await connection.commit();

      return res.status(200).json({ samplePeriods: result });
    } catch (error) {
      defaultLog.error({ label: 'getSurveySamplePeriodRecords', message: 'error', error });
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
  createSurveySamplePeriodRecord()
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
    201: {
      description: 'Sample period added OK.'
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

export function createSurveySamplePeriodRecord(): RequestHandler {
  return async (req, res) => {
    if (!req.body.samplePeriod) {
      throw new HTTP400('Missing required body param `samplePeriod`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const samplePeriod: InsertSamplePeriodRecord = {
        ...req.body.samplePeriod,
        survey_sample_method_id: Number(req.params.surveySampleMethodId)
      };

      await connection.open();

      const samplePeriodService = new SamplePeriodService(connection);

      await samplePeriodService.insertSamplePeriod(samplePeriod);

      await connection.commit();

      return res.status(201).send();
    } catch (error) {
      defaultLog.error({ label: 'createSurveySamplePeriodRecord', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
