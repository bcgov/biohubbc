import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../../constants/roles';
import { SUBMISSION_STATUS_TYPE } from '../../../../../../../constants/status';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { IMessageTypeGroup, SurveyService } from '../../../../../../../services/survey-service';
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
            required: ['id', 'inputFileName', 'status', 'isValidating', 'messageTypes'],
            properties: {
              id: {
                type: 'number',
                minimum: 1
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
              isValidating: {
                description: 'True if the submission has not yet been validated, false otherwise',
                type: 'boolean'
              },
              messageTypes: {
                description: 'An array containing all submission messages grouped by message type',
                type: 'array',
                items: {
                  type: 'object',
                  required: ['severityLabel', 'messageTypeLabel', 'messageStatus', 'messages'],
                  properties: {
                    severityLabel: {
                      type: 'string',
                      description:
                        'The label of the "class" or severity of this type of message, e.g. "Error", "Warning", "Notice", etc.'
                    },
                    messageTypeLabel: {
                      type: 'string',
                      description: 'The name of the type of error pertaining to this submission'
                    },
                    messageStatus: {
                      type: 'string',
                      description: 'The resulting status of the submission as a consequence of the error'
                    },
                    messages: {
                      type: 'array',
                      description: 'The array of submission messages belonging to this type of message',
                      items: {
                        type: 'object',
                        description: 'A submission message object belonging to a particular message type group',
                        required: ['id', 'message'],
                        properties: {
                          id: {
                            type: 'number',
                            description: 'The ID of this submission message'
                          },
                          message: {
                            type: 'string',
                            description: 'The actual message which describes the concern in detail'
                          }
                        }
                      }
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
    defaultLog.debug({
      label: 'getOccurrenceSubmission',
      description: 'Gets an occurrence submission',
      req_params: req.params
    });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);
      const occurrenceSubmission = await surveyService.getLatestSurveyOccurrenceSubmission(Number(req.params.surveyId));

      if (!occurrenceSubmission || occurrenceSubmission.delete_timestamp) {
        // Ensure we only retrieve the latest occurrence submission record if it has not been soft deleted
        return res.status(200).json(null);
      }

      const willFetchAdditionalMessages =
        occurrenceSubmission.submission_status_type_name &&
        [
          // Submission statuses for validation/transformation failure
          SUBMISSION_STATUS_TYPE.SYSTEM_ERROR,
          SUBMISSION_STATUS_TYPE.FAILED_OCCURRENCE_PREPARATION,
          SUBMISSION_STATUS_TYPE.FAILED_VALIDATION,
          SUBMISSION_STATUS_TYPE.FAILED_TRANSFORMED,
          SUBMISSION_STATUS_TYPE.FAILED_PROCESSING_OCCURRENCE_DATA,
          SUBMISSION_STATUS_TYPE['AWAITING CURRATION'],
          SUBMISSION_STATUS_TYPE.REJECTED,
          SUBMISSION_STATUS_TYPE['ON HOLD']
        ].includes(occurrenceSubmission.submission_status_type_name);

      const isDoneValidating =
        willFetchAdditionalMessages ||
        (occurrenceSubmission.submission_status_type_name &&
          [
            // Submission statuses for validation completion
            SUBMISSION_STATUS_TYPE.TEMPLATE_VALIDATED,
            SUBMISSION_STATUS_TYPE.DARWIN_CORE_VALIDATED
          ].includes(occurrenceSubmission.submission_status_type_name));

      const messageTypes: IMessageTypeGroup[] = willFetchAdditionalMessages
        ? await surveyService.getOccurrenceSubmissionMessages(Number(occurrenceSubmission.id))
        : [];

      return res.status(200).json({
        id: occurrenceSubmission.id,
        inputFileName: occurrenceSubmission.input_file_name,
        status: occurrenceSubmission.submission_status_type_name || null,
        isValidating: !isDoneValidating,
        messageTypes
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
