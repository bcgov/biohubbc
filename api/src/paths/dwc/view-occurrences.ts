import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../constants/roles';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../../constants/status';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/http-error';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { ErrorService } from '../../services/error-service';
import { OccurrenceService } from '../../services/occurrence-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/dwc/view-occurrences');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.body.project_id),
          discriminator: 'ProjectRole'
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
            project_id: {
              type: 'number'
            },
            occurrence_submission_id: {
              description: 'A survey occurrence submission ID',
              type: 'number',
              example: 1
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

    if (!req.body || !req.body.occurrence_submission_id) {
      throw new HTTP400('Missing required request body param `occurrence_submission_id`');
    }

    try {
      await connection.open();
      const service = new OccurrenceService(connection);
      const occurrenceData = await service.getOccurrences(req.body.occurrence_submission_id);
      await connection.commit();

      return res.status(200).json(occurrenceData);
    } catch (error) {
      defaultLog.error({ label: 'getOccurrencesForView', message: 'error', error });

      const errorService = new ErrorService(connection);

      await errorService.insertSubmissionStatusAndMessage(
        req['occurrence_submission'].occurrence_submission_id,
        SUBMISSION_STATUS_TYPE.FAILED_GET_OCCURRENCE,
        SUBMISSION_MESSAGE_TYPE.ERROR,
        "" //error.message
      );
      throw error;
    } finally {
      connection.release();
    }
  };
}
