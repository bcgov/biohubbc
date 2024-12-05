import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { ICreateSamplingPeriodRequest } from '../../../../../../../models/sample-period';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { SampleMethodService } from '../../../../../../../services/sample-method-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/sample-site/sample-period');

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
  description: 'Insert survey sample periods for the given sampling sites and technique',
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
    }
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['method_technique_id', 'sample_sites'],
          properties: {
            method_technique_id: {
              type: 'integer',
              minimum: 1,
              description: 'Primary key of the technique to use when creating the periods'
            },
            sample_sites: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['survey_sample_site_id', 'sample_periods'],
                properties: {
                  survey_sample_site_id: {
                    type: 'integer',
                    minimum: 1,
                    description: 'Primary key of a sampling site to create a period for'
                  },
                  method_response_metric_id: {
                    type: 'integer',
                    description: 'TEMPORARY - REMOVE AFTER METHOD RESPONSE METRIC IS MOVED TO TECHNIQUE'
                  },
                  sample_periods: {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      required: ['start_date', 'end_date'],
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
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const data = req.body as ICreateSamplingPeriodRequest;

      const sampleMethodService = new SampleMethodService(connection);

      await sampleMethodService.insertSampleMethods(
        data.sample_sites.map((site) => ({
          survey_sample_site_id: site.survey_sample_site_id,
          method_technique_id: data.method_technique_id,
          sample_periods: site.sample_periods,
          description: null,
          // TODO: Move method response metric to technique
          method_response_metric_id: site.method_response_metric_id
        }))
      );

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
