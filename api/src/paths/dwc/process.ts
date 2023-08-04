import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../constants/roles';
import { SUBMISSION_STATUS_TYPE } from '../../constants/status';
import { getDBConnection } from '../../database/db';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { ErrorService } from '../../services/error-service';
import { ValidationService } from '../../services/validation-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/dwc/process');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
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
  processDWCFile()
];

export const getValidateAPIDoc = (basicDescription: string, successDescription: string, tags: string[]) => {
  return {
    description: basicDescription,
    tags: tags,
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
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: successDescription,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string'
                },
                reason: {
                  type: 'string'
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
};

POST.apiDoc = {
  ...getValidateAPIDoc(
    'Validates and processes a Darwin Core (DWC) Archive survey observation submission.',
    'Validate and process a Darwin Core (DWC) Archive survey observation submission OK',
    ['survey', 'observation', 'dwc']
  )
};

export function processDWCFile(): RequestHandler {
  return async (req, res) => {
    const submissionId = req.body.occurrence_submission_id;

    res.status(200).json({ status: 'success' });

    const connection = getDBConnection(req['keycloak_token']);
    try {
      await connection.open();

      const service = new ValidationService(connection);

      await service.processDWCFile(submissionId);

      await connection.commit();
    } catch (error: any) {
      defaultLog.error({ label: 'persistParseErrors', message: 'error', error });

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
