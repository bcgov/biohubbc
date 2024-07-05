import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { BctwService, getBctwUser } from '../../../../../../services/bctw-service';
import { ObservationService } from '../../../../../../services/observation-service';
import { SurveyCritterService } from '../../../../../../services/survey-critter-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/data');

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
  getSurveyData()
];

GET.apiDoc = {
  description: 'Returns all data for a Survey, including species observations, animals, and telemetry',
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
              'latitude',
              'longitude',
              'count',
              'itis_tsn',
              'itis_scientific_name',
              'observation_date',
              'observation_time',
              'survey_sample_site_id',
              'survey_sample_method_id',
              'survey_sample_period_id',
              'create_user',
              'create_date',
              'update_user',
              'update_date',
              'revision_count'
            ],
            properties: {
              survey_observation_id: {
                type: 'integer'
              },
              survey_id: {
                type: 'integer'
              },
              latitude: {
                type: 'number'
              },
              longitude: {
                type: 'number'
              },
              count: {
                type: 'integer'
              },
              itis_tsn: {
                type: 'integer'
              },
              itis_scientific_name: {
                type: 'string',
                nullable: true
              },
              observation_date: {
                type: 'string'
              },
              observation_time: {
                type: 'string'
              },
              survey_sample_site_id: {
                type: 'integer',
                nullable: true
              },
              survey_sample_method_id: {
                type: 'integer',
                nullable: true
              },
              survey_sample_period_id: {
                type: 'integer',
                nullable: true
              },
              create_date: {
                type: 'string',
                description: 'ISO 8601 date string'
              },
              create_user: {
                type: 'integer',
                minimum: 1
              },
              update_date: {
                type: 'string',
                description: 'ISO 8601 date string',
                nullable: true
              },
              update_user: {
                type: 'integer',
                minimum: 1,
                nullable: true
              },
              revision_count: {
                type: 'integer',
                minimum: 0
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
 * Fetch all data for a Survey - observations, animals, and telemetry
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getSurveyData(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'getSurveyData', surveyId });

    const connection = getDBConnection(req['keycloak_token']);
    const user = getBctwUser(req);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);
      const surveyCritterService = new SurveyCritterService(connection);
      const bctwService = new BctwService(user);

      const observations =
        await observationService.getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData(surveyId);
      const animals = await surveyCritterService.getCrittersInSurvey(surveyId);

      const deployments = await bctwService.getDeploymentsByCritterId(
        animals.map((animal) => animal.critterbase_critter_id)
      );
      const telemetry = await bctwService.getAllTelemetryByDeploymentIds(
        deployments.map((deployment) => deployment.deployment_id)
      );

      const data = { observations, animals, deployments, telemetry };

      return res.status(200).json(data);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyObservation', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
