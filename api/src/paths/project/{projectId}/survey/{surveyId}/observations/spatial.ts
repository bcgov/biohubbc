import { SchemaObject } from 'ajv';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../services/observation-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation');

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
  getSurveyObservationsGeometry()
];

export const surveyObservationsSupplementaryData: SchemaObject = {
  type: 'object',
  required: ['observationCount'],
  properties: {
    observationCount: {
      type: 'integer',
      minimum: 0
    }
  }
};
GET.apiDoc = {
  description: 'Get all observations for the survey.',
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
        type: 'number',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey Observations spatial get response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            nullable: true,
            required: ['supplementaryObservationData', 'surveyObservationsGeometry'],
            properties: {
              supplementaryObservationData: { ...surveyObservationsSupplementaryData },
              surveyObservationsGeometry: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['survey_observation_id', 'geojson'],
                  properties: {
                    survey_observation_id: {
                      type: 'integer'
                    },
                    geojson: {
                      type: 'object'
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
 * Fetch all observations for a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getSurveyObservationsGeometry(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'getSurveyObservationsGeometry', surveyId });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const observationData = await observationService.getSurveyObservationsGeometryWithSupplementaryData(surveyId);

      return res.status(200).json(observationData);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyObservationsGeometry', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
