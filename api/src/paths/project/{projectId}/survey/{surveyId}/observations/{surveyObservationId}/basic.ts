import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../../services/observation-services/observation-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/{surveyObservationId}');

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
  getSurveyObservation()
];

GET.apiDoc = {
  description: 'Get single observation for the survey.',
  tags: ['observation'],
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
      name: 'surveyObservationId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey Observations get response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: [
              'survey_observation_id',
              'survey_id',
              'itis_tsn',
              'itis_scientific_name',
              'survey_sample_period_id',
              'count',
              'latitude',
              'longitude',
              'observation_date',
              'observation_time',
              'observation_sign_id',
              'survey_sample_site_id',
              'survey_sample_site_name',
              'method_technique_id',
              'method_technique_name',
              'survey_sample_period_start_datetime'
            ],
            properties: {
              // Observation data
              survey_observation_id: {
                type: 'integer',
                minimum: 1
              },
              survey_id: {
                type: 'integer',
                minimum: 1
              },
              itis_tsn: {
                type: 'integer'
              },
              itis_scientific_name: {
                type: 'string',
                nullable: true
              },
              survey_sample_period_id: {
                type: 'integer',
                minimum: 1,
                nullable: true
              },
              count: {
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
              observation_sign_id: {
                type: 'integer',
                minimum: 1
              },
              // Additional sampling data
              survey_sample_site_id: {
                type: 'integer',
                minimum: 1,
                nullable: true
              },
              survey_sample_site_name: {
                type: 'string',
                nullable: true
              },
              method_technique_id: {
                type: 'integer',
                minimum: 1,
                nullable: true
              },
              method_technique_name: {
                type: 'string',
                nullable: true
              },
              survey_sample_period_start_datetime: {
                type: 'string',
                nullable: true
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
 * Get a survey observation record.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getSurveyObservation(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const surveyObservationId = Number(req.params.surveyObservationId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const observationData = await observationService.getSurveyObservationById(surveyId, surveyObservationId);

      await connection.commit();

      return res.status(200).json(observationData);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyObservation', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
