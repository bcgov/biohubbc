import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../constants/roles';
import { SUBMISSION_STATUS_TYPE } from '../../constants/status';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/http-error';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { ErrorService } from '../../services/error-service';
import { ValidationService } from '../../services/validation-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/dwc/validate');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.body.project_id),
          discriminator: 'ProjectRole'
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
            required: ['project_id', 'occurrence_submission_id'],
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

//NOTES:
//  Do we want a validation service, or an error service?
// Currently, a failed validation is a submission status state
// option 1: we keep it the way it is, and tailor the error message ... ie SQL, or other custom message
// option 2: create a validation service, to group all validation related functions ... some reuse between dwc and xlsx validation
// option 3: create an error-service, to manage all kinds of errors ... submission as a starting point
// or some combination.
// Both option 2 and 3 could help introduce more granular error messages and message types

POST.apiDoc = {
  ...getValidateAPIDoc(
    'Validates a Darwin Core (DWC) Archive survey observation submission.',
    'Validate Darwin Core (DWC) Archive survey observation submission OK',
    ['survey', 'observation', 'dwc']
  )
};

export function processDWCFile(): RequestHandler {
  return async (req, res, next) => {
    const submissionId = req.body.occurrence_submission_id;
    if (!submissionId) {
      throw new HTTP400('Missing required paramter `occurrence field`');
    }

    res.status(200).json({ status: 'success' });
    const connection = getDBConnection(req['keycloak_token']);
    try {
      await connection.open();

      const service = new ValidationService(connection);
      await service.processDWCFile(submissionId);

      await connection.commit();

      return res.status(200).json({ status: 'failed' });
    } catch (error: any) {
      defaultLog.error({ label: 'persistParseErrors', message: 'error', error });
      // Unexpected error occured, rolling DB back to safe state
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
