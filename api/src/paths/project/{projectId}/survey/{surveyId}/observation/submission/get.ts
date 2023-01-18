import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../../constants/roles';
import { MESSAGE_CLASS_NAME, SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../../../../../../../constants/status';
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

const messageClassGroupValidation = {
  type: 'object',
  properties: {
    classLabel: {
      type: 'string',
      description: 'The label for the message class, e.g. "Error", "Warning"'
    },
    messageGroups: {
      type: 'array',
      description: 'An array of the groups of messages belonging to this class',
      items: {
        type: 'object',
        description: 'A submission message group object. The severity of all messages belonging to this group is inherited by its parent message class.',
        properties: {
          groupLabel: {
            type: 'string',
            description: 'The label belonging to this submission message group'
          },
          messages: {
            type: 'array',
            description: 'The array of submission messages belonging to this group',
            items: {
              type: 'object',
              description: '', // TODO
              properties: {
                id: {
                  type: 'number',
                  description: 'The ID of this submission message'
                },
                message: {
                  type: 'string',
                  description: 'The actual message which describes the concern in detail'
                },

                /**
                 * @TODO need to reconsile these two
                 */
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
}

const messageClassGroups: Record<keyof typeof MESSAGE_CLASS_NAME, any> = {
  'ERROR': { ...messageClassGroupValidation },
  'NOTICE': { ...messageClassGroupValidation },
  'WARNING': { ...messageClassGroupValidation }
}

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
            required: ['id', 'inputFileName', 'status', 'isValidating', 'messageClasses'],
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
              messageClasses: {
                description: '', // TODO
                type: 'object',
                items: {
                  type: 'object',
                  description: '', // TODO
                  properties: {
                    ...messageClassGroups
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

enum MESSAGE_GROUP_LABEL {
  MANDATORY = 'Mandatory fields have not been filled out',
  RECOMMENDED = 'Recommended fields have not been filled out',
  VALUE_NOT_FROM_LIST = "Values have not been selected from the field's dropdown list",
  UNSUPPORTED_HEADER = 'Column headers are not supported',
  OUT_OF_RANGE = 'Values are out of range',
  FORMATTING_ERRORS = 'Unexpected formats in the values provided',
  MISCELLANEOUS = 'Miscellaneous errors exist in your file',
  SYSTEM_ERROR = 'Contact your system administrator'
}

/**
 * 
 */
const submissionMessageClassMappings: Record<
  keyof typeof MESSAGE_GROUP_LABEL,
  keyof typeof MESSAGE_CLASS_NAME
> = {
  'MANDATORY': 'ERROR'
  'RECOMMENDED': 'Recommended fields have not been filled out',
  'VALUE_NOT_FROM_LIST': "Values have not been selected from the field's dropdown list",
  UNSUPPORTED_HEADER: 'Column headers are not supported',
  OUT_OF_RANGE: 'Values are out of range',
  FORMATTING_ERRORS: 'Unexpected formats in the values provided',
  MISCELLANEOUS: 'Miscellaneous errors exist in your file',
  SYSTEM_ERROR: 'Contact your system administrator'
}

/**
 * 
 */
const submissionMessageGroupMappings: Partial<Record<
  keyof typeof SUBMISSION_MESSAGE_TYPE,
  keyof typeof MESSAGE_GROUP_LABEL
>> = {
  // Mandatory fields have not been filled out
  'MISSING_REQUIRED_FIELD':    'MANDATORY',
  'MISSING_REQUIRED_HEADER':   'MANDATORY',
  'DUPLICATE_HEADER':          'MANDATORY',
  'DANGLING_PARENT_CHILD_KEY': 'MANDATORY',
  'NON_UNIQUE_KEY':            'MANDATORY',

  // Recommended fields have not been filled out
  'MISSING_RECOMMENDED_HEADER': 'RECOMMENDED',

  // Values have not been selected from the field's dropdown list
  'INVALID_VALUE': 'VALUE_NOT_FROM_LIST',

  // Column headers are not supported
  'UNKNOWN_HEADER': 'UNSUPPORTED_HEADER',

  // Values are out of range
  'OUT_OF_RANGE': 'OUT_OF_RANGE',

  // Unexpected formats in the values provided
  'UNEXPECTED_FORMAT': 'FORMATTING_ERRORS',

  // Miscellaneous errors exist in your file
  'MISCELLANEOUS': 'MISCELLANEOUS',

  // Contact your system administrator
  'FAILED_GET_FILE_FROM_S3':                'SYSTEM_ERROR',
  'FAILED_GET_OCCURRENCE':                  'SYSTEM_ERROR',
  'FAILED_UPLOAD_FILE_TO_S3':               'SYSTEM_ERROR',
  'FAILED_PARSE_SUBMISSION':                'SYSTEM_ERROR',
  'FAILED_PREP_DWC_ARCHIVE':                'SYSTEM_ERROR',
  'FAILED_PREP_XLSX':                       'SYSTEM_ERROR',
  'FAILED_PERSIST_PARSE_ERRORS':            'SYSTEM_ERROR',
  'FAILED_GET_VALIDATION_RULES':            'SYSTEM_ERROR',
  'FAILED_GET_TRANSFORMATION_RULES':        'SYSTEM_ERROR',
  'FAILED_PERSIST_TRANSFORMATION_RESULTS':  'SYSTEM_ERROR',
  'FAILED_TRANSFORM_XLSX':                  'SYSTEM_ERROR',
  'FAILED_VALIDATE_DWC_ARCHIVE':            'SYSTEM_ERROR',
  'FAILED_PERSIST_VALIDATION_RESULTS':      'SYSTEM_ERROR',
  'FAILED_UPDATE_OCCURRENCE_SUBMISSION':    'SYSTEM_ERROR',
  'FAILED_TO_GET_TRANSFORM_SCHEMA':         'SYSTEM_ERROR',
  'UNSUPPORTED_FILE_TYPE':                  'SYSTEM_ERROR',
  'INVALID_MEDIA':                          'SYSTEM_ERROR',
  // 'ERROR': 'SYSTEM_ERROR',
  // 'PARSE_ERROR': 'SYSTEM_ERROR',
  // 'MISSING_VALIDATION_SCHEM': 'SYSTEM_ERROR'A

}
const getErrors = () => {
  type MessageGrouping = { [key: string]: { type: string[]; label: string } };

  const messageGrouping: MessageGrouping = {

    system_error: {
      type: [
        
      ],
      label: ''
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
