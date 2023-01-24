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
import { SubmissionError } from '../../utils/submission-error';

const defaultLog = getLogger('paths/xlsx/process');

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
  processFile()
];

POST.apiDoc = {
  description:
    'Validates, transforms and scrapes an XLSX survey observation submission file into a Darwin Core Archive file, and scrapes the occurences from the DwC archive',
  tags: ['survey', 'observation', 'xlsx'],
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
            },
            survey_id: {
              type: 'number'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Transform XLSX survey observation submission OK',
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
      $ref: '#/components/responses/401'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function processFile(): RequestHandler {
  return async (req, res) => {
    const submissionId = req.body.occurrence_submission_id;
    const surveyId = req.body.survey_id;
    if (!submissionId) {
      throw new HTTP400('Missing required parameter `occurrence field`');
    }

    res.status(200).json({ status: 'success' });

    const connection = getDBConnection(req['keycloak_token']);
    try {
      await connection.open();

      const validationService = new ValidationService(connection);

      try {
        // process the raw template data
        await validationService.processXLSXFile(submissionId, surveyId);
        // process the resulting transformed dwc data
        await validationService.processDWCFile(submissionId);
      } catch (error: any) {
        // Since submission errors are caught by the validation service and persisted in the database, anything
        // outside of a submission message should be thrown here.
        if (!(error instanceof SubmissionError)) {
          throw error;
        }
      }

      await connection.commit();
    } catch (error) {
      defaultLog.error({ label: 'xlsx process', message: 'error', error });
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
