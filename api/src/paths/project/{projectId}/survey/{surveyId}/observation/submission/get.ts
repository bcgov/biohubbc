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
            required: ['id', 'inputFileName', 'status', 'isValidating', 'messages'],
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
              isValidating: {
                description: 'True if the submission has not yet been validated, false otherwise',
                type: 'boolean'
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

interface IMessageGroup {
  severityLabel: string
  messages: IMessage[]
}

const getErrors = () => {
  type MessageGrouping = { [key: string]: { type: string[]; label: string } };

  const messageGrouping: MessageGrouping = {
    mandatory: {
      type: [
        SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_FIELD,
        SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER,
        SUBMISSION_MESSAGE_TYPE.DUPLICATE_HEADER,
        SUBMISSION_MESSAGE_TYPE.DANGLING_PARENT_CHILD_KEY,
        SUBMISSION_MESSAGE_TYPE.NON_UNIQUE_KEY
      ],
      label: 'Mandatory fields have not been filled out'
    },
    recommended: {
      type: [SUBMISSION_MESSAGE_TYPE.MISSING_RECOMMENDED_HEADER],
      label: 'Recommended fields have not been filled out'
    },
    value_not_from_list: {
      type: [SUBMISSION_MESSAGE_TYPE.INVALID_VALUE],
      label: "Values have not been selected from the field's dropdown list"
    },
    unsupported_header: {
      type: [SUBMISSION_MESSAGE_TYPE.UNKNOWN_HEADER],
      label: 'Column headers are not supported'
    },
    out_of_range: {
      type: [SUBMISSION_MESSAGE_TYPE.OUT_OF_RANGE],
      label: 'Values are out of range'
    },
    formatting_errors: {
      type: [SUBMISSION_MESSAGE_TYPE.UNEXPECTED_FORMAT],
      label: 'Unexpected formats in the values provided'
    },
    miscellaneous: { type: [SUBMISSION_MESSAGE_TYPE.MISCELLANEOUS], label: 'Miscellaneous errors exist in your file' },
    system_error: {
      type: [
        SUBMISSION_MESSAGE_TYPE.FAILED_GET_FILE_FROM_S3,
        SUBMISSION_MESSAGE_TYPE.ERROR,
        SUBMISSION_MESSAGE_TYPE.PARSE_ERROR,
        SUBMISSION_MESSAGE_TYPE.FAILED_GET_OCCURRENCE,
        SUBMISSION_MESSAGE_TYPE.FAILED_UPLOAD_FILE_TO_S3,
        SUBMISSION_MESSAGE_TYPE.FAILED_PARSE_SUBMISSION,
        SUBMISSION_MESSAGE_TYPE.FAILED_PREP_DWC_ARCHIVE,
        SUBMISSION_MESSAGE_TYPE.FAILED_PREP_XLSX,
        SUBMISSION_MESSAGE_TYPE.FAILED_PERSIST_PARSE_ERRORS,
        SUBMISSION_MESSAGE_TYPE.FAILED_GET_VALIDATION_RULES,
        SUBMISSION_MESSAGE_TYPE.FAILED_GET_TRANSFORMATION_RULES,
        SUBMISSION_MESSAGE_TYPE.FAILED_PERSIST_TRANSFORMATION_RESULTS,
        SUBMISSION_MESSAGE_TYPE.FAILED_TRANSFORM_XLSX,
        SUBMISSION_MESSAGE_TYPE.FAILED_VALIDATE_DWC_ARCHIVE,
        SUBMISSION_MESSAGE_TYPE.FAILED_PERSIST_VALIDATION_RESULTS,
        SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION,
        SUBMISSION_MESSAGE_TYPE.FAILED_TO_GET_TRANSFORM_SCHEMA,
        SUBMISSION_MESSAGE_TYPE.UNSUPPORTED_FILE_TYPE,
        SUBMISSION_MESSAGE_TYPE.INVALID_MEDIA,
        SUBMISSION_MESSAGE_TYPE.MISSING_VALIDATION_SCHEMA
      ],
      label: 'Contact your system administrator'
    }
  };

  type SubmissionErrors = { [key: string]: string[] };
  type SubmissionWarnings = { [key: string]: string[] };

  const submissionErrors: SubmissionErrors = {};
  const submissionWarnings: SubmissionWarnings = {};
}


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
        isValidating: !hasAdditionalOccurrenceSubmissionMessages,
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
