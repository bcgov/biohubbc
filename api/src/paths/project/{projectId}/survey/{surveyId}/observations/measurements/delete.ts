import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { ObservationSubCountMeasurementService } from '../../../../../../../services/observation-subcount-measurement-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observations/measurements');

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
  deleteObservationMeasurements()
];

POST.apiDoc = {
  description: 'Delete survey observation measurements.',
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
  requestBody: {
    description: 'Survey observation measurement delete request body.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            measurement_ids: {
              description: 'An array of measurement ids (critterbase taxon measurement ids) to delete',
              type: 'array',
              minItems: 1,
              items: {
                type: 'string',
                format: 'uuid'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Delete OK'
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
 * Deletes survey observation measurement records, for all observation records, for the given survey and set of
 * measurement ids.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function deleteObservationMeasurements(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'deleteObservationMeasurements', surveyId });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const service = new ObservationSubCountMeasurementService(connection);
      await service.deleteMeasurementsForTaxonMeasurementIds(surveyId, req.body.measurement_ids);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteObservationMeasurements', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
