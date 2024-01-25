import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { SUBMISSION_STATUS_TYPE } from '../../../../../../../../constants/status';
import { getDBConnection } from '../../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { HistoryPublishService } from '../../../../../../../../services/history-publish-service';
import { IMessageTypeGroup, SurveyService } from '../../../../../../../../services/survey-service';
import { getLogger } from '../../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/dwca/observations/submission/get');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ],
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
            title: 'Survey get response object, for view purposes',
            type: 'object',
            nullable: true,
            required: ['surveyObservationData', 'surveyObservationSupplementaryData'],
            properties: {
              surveyObservationData: {
                type: 'object',
                nullable: true,
                required: ['occurrence_submission_id', 'inputFileName', 'status', 'isValidating', 'messageTypes'],
                properties: {
                  occurrence_submission_id: {
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
              },
              surveyObservationSupplementaryData: {
                description: 'Survey supplementary data',
                type: 'object',
                nullable: true,
                required: [
                  'occurrence_submission_publish_id',
                  'occurrence_submission_id',
                  'event_timestamp',
                  'submission_uuid',
                  'create_date',
                  'create_user',
                  'update_date',
                  'update_user',
                  'revision_count'
                ],
                properties: {
                  occurrence_submission_publish_id: {
                    type: 'integer',
                    minimum: 1
                  },
                  occurrence_submission_id: {
                    type: 'integer',
                    minimum: 1
                  },
                  event_timestamp: {
                    oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                    description: 'ISO 8601 date string for the project start date'
                  },
                  submission_uuid: {
                    type: 'string',
                    format: 'uuid'
                  },
                  create_date: {
                    oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                    description: 'ISO 8601 date string for the project start date'
                  },
                  create_user: {
                    type: 'integer',
                    minimum: 1
                  },
                  update_date: {
                    oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                    description: 'ISO 8601 date string for the project start date',
                    nullable: true
                  },
                  update_user: {
                    type: 'integer',
                    minimum: 1,
                    nullable: true
                  },
                  revision_count: {
                    type: 'integer',
                    minimum: 0
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
      const historyPublishService = new HistoryPublishService(connection);
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
          SUBMISSION_STATUS_TYPE.INVALID_MEDIA,
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
            SUBMISSION_STATUS_TYPE.DARWIN_CORE_VALIDATED,
            SUBMISSION_STATUS_TYPE.TEMPLATE_TRANSFORMED
          ].includes(occurrenceSubmission.submission_status_type_name));

      const messageTypes: IMessageTypeGroup[] = willFetchAdditionalMessages
        ? await surveyService.getOccurrenceSubmissionMessages(Number(occurrenceSubmission.occurrence_submission_id))
        : [];

      const surveyObservationSupplementaryData = await historyPublishService.getOccurrenceSubmissionPublishRecord(
        occurrenceSubmission.occurrence_submission_id
      );

      return res.status(200).json({
        surveyObservationData: {
          occurrence_submission_id: occurrenceSubmission.occurrence_submission_id,
          inputFileName: occurrenceSubmission.input_file_name,
          status: occurrenceSubmission.submission_status_type_name ?? null,
          isValidating: !isDoneValidating,
          messageTypes
        },
        surveyObservationSupplementaryData: surveyObservationSupplementaryData
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
