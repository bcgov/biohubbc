import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../services/observation-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/process');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          surveyId: Number(req.body.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  processFile()
];

POST.apiDoc = {
  description: 'Processes and validates observation CSV submission',
  tags: ['survey', 'observation', 'csv'],
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
    description: 'Request body',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['observation_submission_id'],
          properties: {
            observation_submission_id: {
              description: 'The ID of the submission to validate',
              type: 'integer'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Validation results of the observation submission',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            nullable: true,
            required: ['surveyObservations'],
            properties: {
              surveyObservations: {
                type: 'array',
                items: {
                  type: 'object',
                  required: [
                    'itis_tsn',
                    'itis_scientific_name',
                    'survey_sample_site_id',
                    'survey_sample_method_id',
                    'survey_sample_period_id',
                    'count',
                    'subcount',
                    'latitude',
                    'longitude',
                    'observation_date',
                    'observation_time'
                  ],
                  properties: {
                    survey_observation_id: {
                      type: 'number',
                      nullable: true
                    },
                    survey_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    itis_tsn: {
                      type: 'integer'
                    },
                    itis_scientific_name: {
                      type: 'string'
                    },
                    survey_sample_site_id: {
                      type: 'number'
                    },
                    survey_sample_method_id: {
                      type: 'number'
                    },
                    survey_sample_period_id: {
                      type: 'number'
                    },
                    count: {
                      type: 'integer'
                    },
                    subcount: {
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
                    },
                    revision_count: {
                      type: 'integer',
                      minimum: 0
                    }
                  },
                  additionalProperties: false
                }
              }
            },
            additionalProperties: false
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

export function processFile(): RequestHandler {
  return async (req, res) => {
    const submissionId = req.body.observation_submission_id;

    const connection = getDBConnection(req['keycloak_token']);
    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const response = await observationService.processObservationCsvSubmission(submissionId);

      res.status(200).json({ surveyObservations: response });

      await connection.commit();
    } catch (error) {
      defaultLog.error({ label: 'processFile', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
