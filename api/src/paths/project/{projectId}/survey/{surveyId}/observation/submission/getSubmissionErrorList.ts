'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/CustomError';
import { getSurveyOccurrenceErrorListSQL } from '../../../../../../../queries/survey/survey-occurrence-queries';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/submission/get');

export const GET: Operation = [getSubmissionErrorList()];

GET.apiDoc = {
  description: 'Fetches a list of errors associated with an observation submission for a survey.',
  tags: ['submission_errors'],
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
      description: 'Observation errors get response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: {
                type: 'number'
              },
              type: {
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

export function getSubmissionErrorList(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get an observation error list', message: 'params', req_params: req.params });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getSurveyOccurrenceErrorListSQLStatement = getSurveyOccurrenceErrorListSQL(Number(req.params.surveyId));

      if (!getSurveyOccurrenceErrorListSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const getSurveyOccurrenceErrorListData = await connection.query(
        getSurveyOccurrenceErrorListSQLStatement.text,
        getSurveyOccurrenceErrorListSQLStatement.values
      );

      await connection.commit();

      const getObservationErrorListData =
        (getSurveyOccurrenceErrorListData && getSurveyOccurrenceErrorListData.rows) || null;
      // (getSurveyOccurrenceErrorListData &&
      //   getSurveyOccurrenceErrorListData.rows &&
      //   getSurveyOccurrenceErrorListData.rows && {
      //     id: getSurveyOccurrenceErrorListData.rows[0].id,
      //     type: getSurveyOccurrenceErrorListData.rows[0].submission_message_type_name,
      //     status: getSurveyOccurrenceErrorListData.rows[0].submission_status_type_name,
      //     message: getSurveyOccurrenceErrorListData.rows[0].message
      //   }) ||
      // null;

      console.log(getObservationErrorListData);

      return res.status(200).json(getObservationErrorListData);
    } catch (error) {
      defaultLog.debug({ label: 'getObservationErrorListData', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
