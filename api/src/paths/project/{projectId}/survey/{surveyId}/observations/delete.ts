import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../services/observation-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/delete');

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
  deleteSurveyObservations()
];

POST.apiDoc = {
  description: 'Delete survey observations.',
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
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      required: true
    }
  ],
  requestBody: {
    description: 'Survey observation record data',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            surveyObservationIds: {
              type: 'array',
              minItems: 1,
              items: {
                anyOf: [
                  {
                    type: 'integer'
                  },
                  {
                    type: 'string'
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Delete OK',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['supplementaryObservationData'],
            properties: {
              supplementaryObservationData: {
                type: 'object',
                additionalProperties: false,
                required: ['observationCount'],
                properties: {
                  observationCount: {
                    type: 'integer',
                    minimum: 0
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
 * Deletes survey observations.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function deleteSurveyObservations(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'deleteSurveyObservations', surveyId });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const deleteObservationIds =
        req.body?.surveyObservationIds?.map((observationId: string | number) => Number(observationId)) ?? [];

      await observationService.deleteObservationsByIds(surveyId, deleteObservationIds);

      const observationCount = await observationService.getSurveyObservationCount(surveyId);

      await connection.commit();

      return res.status(200).json({ supplementaryObservationData: { observationCount } });
    } catch (error) {
      defaultLog.error({ label: 'deleteSurveyObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
