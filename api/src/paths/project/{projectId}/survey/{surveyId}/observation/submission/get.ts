'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/CustomError';
import {
  getLatestSurveyOccurrenceSubmissionSQL,
  getSurveyOccurrenceErrorListSQL
} from '../../../../../../../queries/survey/survey-occurrence-queries';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/submission/get');

export const GET: Operation = [getObservationSubmission()];

GET.apiDoc = {
  description: 'Fetches an observation submission for a survey.',
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
                  type: 'string',
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

export function getObservationSubmission(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get an observation submission', message: 'params', req_params: req.params });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getObservationSubmissionSQLStatement = getLatestSurveyOccurrenceSubmissionSQL(Number(req.params.surveyId));

      if (!getObservationSubmissionSQLStatement) {
        throw new HTTP400('Failed to build SQL statement');
      }

      await connection.open();

      const observationSubmissionData = await connection.query(
        getObservationSubmissionSQLStatement.text,
        getObservationSubmissionSQLStatement.values
      );

      let messageList = [];

      if (
        observationSubmissionData &&
        observationSubmissionData.rows &&
        observationSubmissionData.rows[0] &&
        observationSubmissionData.rows[0].submission_status_type_name === 'Rejected'
      ) {
        const observation_submission_id = observationSubmissionData.rows[0].id;
        const getSubmissionErrorListSQLStatement = getSurveyOccurrenceErrorListSQL(Number(observation_submission_id));

        if (!getSubmissionErrorListSQLStatement) {
          throw new HTTP400('Failed to build SQL statement');
        }

        const submissionErrorListData = await connection.query(
          getSubmissionErrorListSQLStatement.text,
          getSubmissionErrorListSQLStatement.values
        );

        messageList =
          (submissionErrorListData &&
            submissionErrorListData.rows &&
            submissionErrorListData.rows.map((row) => row.message)) ||
          [];
      }

      await connection.commit();

      const getObservationSubmissionData =
        (observationSubmissionData &&
          observationSubmissionData.rows &&
          observationSubmissionData.rows[0] && {
            id: observationSubmissionData.rows[0].id,
            fileName: observationSubmissionData.rows[0].file_name,
            status: observationSubmissionData.rows[0].submission_status_type_name,
            messages: messageList
          }) ||
        null;

      return res.status(200).json(getObservationSubmissionData);
    } catch (error) {
      defaultLog.debug({ label: 'getObservationSubmission', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
