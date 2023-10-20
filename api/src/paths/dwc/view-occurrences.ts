import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../constants/roles';
import { SUBMISSION_STATUS_TYPE } from '../../constants/status';
import { getDBConnection } from '../../database/db';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { ErrorService } from '../../services/error-service';
import { OccurrenceService } from '../../services/occurrence-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/dwc/view-occurrences');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ],
          projectId: Number(req.body.project_id),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getOccurrencesForView()
];

POST.apiDoc = {
  description: 'Get occurrence spatial and metadata, for view-only purposes.',
  tags: ['occurrences'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Request body',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['occurrence_submission_id'],
          properties: {
            occurrence_submission_id: {
              description: 'A survey occurrence submission ID',
              type: 'integer',
              minimum: 1
            },
            project_id: {
              description: 'Project ID that occurrence submission is associated with',
              type: 'integer',
              minimum: 1
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Occurrences spatial and metadata response.',
      content: {
        'application/json': {
          schema: {
            title: 'Occurrences spatial and metadata response object, for view purposes',
            type: 'array',
            items: {}
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
 * Get occurrence spatial and metadata by occurrence submission id.
 *
 * @returns {RequestHandler}
 */
export function getOccurrencesForView(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);
    const submissionId = req.body.occurrence_submission_id;

    try {
      await connection.open();
      const service = new OccurrenceService(connection);
      const occurrenceData = await service.getOccurrences(req.body.occurrence_submission_id);
      await connection.commit();

      return res.status(200).json(occurrenceData);
    } catch (error) {
      defaultLog.error({ label: 'getOccurrencesForView', message: 'error', error });

      // Unexpected error occurred, rolling DB back to safe state
      await connection.rollback();

      // We still want to track that the submission failed to present to the user
      const errorService = new ErrorService(connection);
      await errorService.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.SYSTEM_ERROR);
      await connection.commit();
      throw error;
    } finally {
      connection.release();
    }
  };
}
