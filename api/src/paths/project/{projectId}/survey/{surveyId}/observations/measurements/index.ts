import { Operation } from 'express-openapi';
import { RequestHandler } from 'http-proxy-middleware';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { SubCountService } from '../../../../../../../services/subcount-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observations/measurements');

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
  getSurveyObservationMeasurements()
];

GET.apiDoc = {
  description: 'Get all measurement definitions for the survey.',
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
    }
  ],
  responses: {
    200: {
      description: 'Observation measurements response',
      content: {
        'application/json': {
          schema: {
            description: 'Qualitative and quantitative observation definitions for the survey',
            type: 'object',
            additionalProperties: false,
            required: ['qualitative_measurements', 'quantitative_measurements'],
            properties: {
              qualitative_measurements: {
                type: 'array',
                items: {}
              },
              quantitative_measurements: {
                type: 'array',
                items: {}
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
 * Fetch definitions of all measured for a given survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getSurveyObservationMeasurements(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'getSurveyObservationMeasurement', surveyId });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const subcountService = new SubCountService(connection);

      const observationData = await subcountService.getMeasurementTypeDefinitionsForSurvey(surveyId);

      await connection.commit();

      return res.status(200).json(observationData);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyObservationMeasurements', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
