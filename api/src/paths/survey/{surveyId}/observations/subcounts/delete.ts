import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { SubCountService } from '../../../../../services/subcount-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observations/subcounts/delete');

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
  deleteObservationSubcounts()
];

POST.apiDoc = {
  description:
    'Delete observation subcount records. An observation must have at least one subcount. If all subcount records are deleted, the observation record will also be deleted.',
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
    description: 'Observation subcount IDs to delete.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['observationSubcountIds'],
          properties: {
            observationSubcountIds: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'integer',
                minimum: 1
              }
            }
          }
        }
      }
    }
  },
  responses: {
    204: {
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
 * Deletes observation subcount records, and dependent records.
 *
 * Note: If all subcount records are deleted for a given survey observation record, then the survey observation
 * records will also be deleted, as all survey observations should have at least one subcount.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function deleteObservationSubcounts(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const observationSubcountIds = req.body.observationSubcountIds as number[];

    defaultLog.debug({ label: 'deleteObservationSubcounts', surveyId });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const subcountService = new SubCountService(connection);

      await subcountService.deleteObservationSubcountRecords(surveyId, observationSubcountIds);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteObservationSubcounts', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
