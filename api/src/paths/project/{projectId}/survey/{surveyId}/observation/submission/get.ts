import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../../constants/roles';
import { SUBMISSION_STATUS_TYPE } from '../../../../../../../constants/status';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { queries } from '../../../../../../../queries/queries';
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
        type: 'number'
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number'
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
                  description: 'A validation status message of the observation submission'
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
    defaultLog.debug({ label: 'Get an occurrence submission', message: 'params', req_params: req.params });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const surveyService = new SurveyService(connection);
      const response = await surveyService.getLatestSurveyOccurrenceSubmission(Number(req.params.surveyId));

      // Ensure we only retrieve the latest occurrence submission record if it has not been soft deleted
      if (response.delete_timestamp) {
        return res.status(200).json(null);
      }

      let messageList: any[] = [];

      const errorStatus = response.submission_status_type_name;

      if (
        errorStatus === SUBMISSION_STATUS_TYPE.REJECTED ||
        errorStatus === SUBMISSION_STATUS_TYPE.SYSTEM_ERROR ||
        errorStatus === SUBMISSION_STATUS_TYPE.FAILED_OCCURRENCE_PREPARATION ||
        errorStatus === SUBMISSION_STATUS_TYPE.FAILED_VALIDATION ||
        errorStatus === SUBMISSION_STATUS_TYPE.FAILED_TRANSFORMED ||
        errorStatus === SUBMISSION_STATUS_TYPE.FAILED_PROCESSING_OCCURRENCE_DATA
      ) {
        const occurrence_submission_id = response.id;

        const getSubmissionErrorListSQLStatement = queries.survey.getOccurrenceSubmissionMessagesSQL(
          Number(occurrence_submission_id)
        );

        if (!getSubmissionErrorListSQLStatement) {
          throw new HTTP400('Failed to build SQL getOccurrenceSubmissionMessagesSQL statement');
        }

        const submissionErrorListData = await connection.query(
          getSubmissionErrorListSQLStatement.text,
          getSubmissionErrorListSQLStatement.values
        );

        messageList = (submissionErrorListData && submissionErrorListData.rows) || [];
      }

      await connection.commit();

      const getOccurrenceSubmissionData =
        (response && {
          id: response.id,
          inputFileName: response.input_file_name,
          status: response.submission_status_type_name,
          messages: messageList
        }) ||
        null;

      return res.status(200).json(getOccurrenceSubmissionData);
    } catch (error) {
      defaultLog.error({ label: 'getOccurrenceSubmission', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
