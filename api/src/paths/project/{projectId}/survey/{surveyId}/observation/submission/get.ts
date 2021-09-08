'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/CustomError';
import {
  getLatestSurveyOccurrenceSubmissionSQL,
  getOccurrenceSubmissionMessagesSQL
} from '../../../../../../../queries/survey/survey-occurrence-queries';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/submission/get');

export const GET: Operation = [getOccurrenceSubmission()];

GET.apiDoc = {
  description: 'Fetches an observation occurrence submission for a survey.',
  tags: ['observation_submission'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
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
            properties: {
              id: {
                type: 'number'
              },
              fileName: {
                description: 'The file name of the submission',
                type: 'string'
              },
              status: {
                description: 'The validation status of the submission',
                type: 'string'
              },
              messages: {
                description: 'The validation status messages of the submission',
                type: 'array',
                items: {
                  type: 'object',
                  description: 'A validation status message of the submission'
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
      const getOccurrenceSubmissionSQLStatement = getLatestSurveyOccurrenceSubmissionSQL(Number(req.params.surveyId));

      if (!getOccurrenceSubmissionSQLStatement) {
        throw new HTTP400('Failed to build SQL getLatestSurveyOccurrenceSubmissionSQL statement');
      }

      await connection.open();

      const occurrenceSubmissionData = await connection.query(
        getOccurrenceSubmissionSQLStatement.text,
        getOccurrenceSubmissionSQLStatement.values
      );

      // Ensure we only retrieve the latest occurrence submission record if it has not been soft deleted
      if (
        !occurrenceSubmissionData ||
        !occurrenceSubmissionData.rows ||
        !occurrenceSubmissionData.rows[0] ||
        occurrenceSubmissionData.rows[0].delete_timestamp
      ) {
        return res.status(200).json(null);
      }

      let messageList: any[] = [];

      const errorStatus = occurrenceSubmissionData.rows[0].submission_status_type_name;

      if (errorStatus === 'Rejected' || errorStatus === 'System Error') {
        const occurrence_submission_id = occurrenceSubmissionData.rows[0].id;

        const getSubmissionErrorListSQLStatement = getOccurrenceSubmissionMessagesSQL(Number(occurrence_submission_id));

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
        (occurrenceSubmissionData &&
          occurrenceSubmissionData.rows &&
          occurrenceSubmissionData.rows[0] && {
            id: occurrenceSubmissionData.rows[0].id,
            fileName: occurrenceSubmissionData.rows[0].file_name,
            status: occurrenceSubmissionData.rows[0].submission_status_type_name,
            messages: messageList
          }) ||
        null;

      return res.status(200).json(getOccurrenceSubmissionData);
    } catch (error) {
      defaultLog.debug({ label: 'getOccurrenceSubmission', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
