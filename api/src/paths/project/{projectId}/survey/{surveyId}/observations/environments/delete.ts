import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { ObservationSubCountEnvironmentService } from '../../../../../../../services/observation-subcount-environment-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observations/environments');

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
  deleteObservationEnvironments()
];

POST.apiDoc = {
  description: 'Delete survey observation environments.',
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
    description: 'Survey observation environment delete request body.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            environment_qualitative_id: {
              description: 'An array of qualitative environment ids to delete',
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid'
              }
            },
            environment_quantitative_id: {
              description: 'An array of quantitative environment ids to delete',
              type: 'array',
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
 * Deletes survey observation environment records, for all observation records, for the given survey and set of
 * environment ids.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function deleteObservationEnvironments(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      const surveyId = Number(req.params.surveyId);

      const environmentIds = {
        environment_qualitative_id: req.body.environment_qualitative_id,
        environment_quantitative_id: req.body.environment_quantitative_id
      };

      defaultLog.debug({ label: 'deleteObservationEnvironments', surveyId });
      await connection.open();

      const service = new ObservationSubCountEnvironmentService(connection);
      await service.deleteEnvironmentsForEnvironmentIds(surveyId, environmentIds);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteObservationEnvironments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
