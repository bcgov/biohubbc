import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../../constants/roles';
import { SUBMISSION_STATUS_TYPE } from '../../../../../../../constants/status';
import { getDBConnection } from '../../../../../../../database/db';
import { IOccurrenceSubmissionMessagesResponse } from '../../../../../../../repositories/survey-repository';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../../../../services/survey-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/submission/get');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getOccurrenceSubmission()
];

GET.apiDoc = {
  description: 'Fetches an observation occurrence submission for a survey.',
  tags: ['observation_submission'],
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
        type: 'number',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Observation submission get response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            nullable: true,
            properties: {
              id: {
                type: 'number'
              },
              inputFileName: {
                description: 'The file name of the submission',
                type: 'string'
              },
              status: {
                description: 'The validation status of the submission',
                nullable: true,
                type: 'string'
              },
              messages: {
                description: 'The validation status messages of the observation submission',
                type: 'array',
                items: {
                  type: 'object',
                  description: 'A validation status message of the observation submission',
                  properties: {
                    id: {
                      type: 'number',
                      description: 'The ID of the error message for this submission'
                    },
                    class: {
                      type: 'string',
                      description: 'The class of the error message, such as Error, Warning, etc.'
                    },
                    message: {
                      type: 'string',
                      description: 'The message which describes the error in detail'
                    },
                    status: {
                      type: 'string',
                      description: 'The resulting status of the submission as a consequence of the error'
                    },
                    type: {
                      type: 'string',
                      description: 'The type of error pertaining to this submission'
                    }
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

export function getOccurrenceSubmission(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getOccurrenceSubmission', description: 'Gets an occurrence submission', req_params: req.params });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);
      const occurrenceSubmission = await surveyService.getLatestSurveyOccurrenceSubmission(Number(req.params.surveyId));

      if (!occurrenceSubmission || occurrenceSubmission.delete_timestamp) {
        // Ensure we only retrieve the latest occurrence submission record if it has not been soft deleted
        return res.status(200).json(null);
      }

      const hasAdditionalOccurrenceSubmissionMessages = [
        SUBMISSION_STATUS_TYPE.REJECTED,
        SUBMISSION_STATUS_TYPE.SYSTEM_ERROR,
        SUBMISSION_STATUS_TYPE.FAILED_OCCURRENCE_PREPARATION,
        SUBMISSION_STATUS_TYPE.FAILED_VALIDATION,
        SUBMISSION_STATUS_TYPE.FAILED_TRANSFORMED,
        SUBMISSION_STATUS_TYPE.FAILED_PROCESSING_OCCURRENCE_DATA
      ].includes(occurrenceSubmission.submission_status_type_name)
     
      const messages: IOccurrenceSubmissionMessagesResponse[] = hasAdditionalOccurrenceSubmissionMessages
        ? await surveyService.getOccurrenceSubmissionMessages(Number(occurrenceSubmission.id))
        : [];

      return res.status(200).json({
        id: occurrenceSubmission.id,
        inputFileName: occurrenceSubmission.input_file_name,
        status: occurrenceSubmission.submission_status_type_name,
        messages
      });
    } catch (error) {
      defaultLog.error({ label: 'getOccurrenceSubmission', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
