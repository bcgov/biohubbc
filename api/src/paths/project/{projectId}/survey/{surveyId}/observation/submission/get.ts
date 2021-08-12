'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/CustomError';
import { getLatestSurveyOccurrenceSubmissionSQL } from '../../../../../../../queries/survey/survey-occurrence-queries';
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
              message: {
                description: 'The validation status message of the submission',
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
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const observationSubmissionData = await connection.query(
        getObservationSubmissionSQLStatement.text,
        getObservationSubmissionSQLStatement.values
      );

      await connection.commit();

      const getObservationSubmissionData =
        (observationSubmissionData &&
          observationSubmissionData.rows &&
          observationSubmissionData.rows[0] && {
            id: observationSubmissionData.rows[0].id,
            fileName: observationSubmissionData.rows[0].file_name,
            status: observationSubmissionData.rows[0].submission_status_type_name,
            message: observationSubmissionData.rows[0].message
          }) ||
        null;

      console.log('********************************');
      console.log(getObservationSubmissionData);

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
