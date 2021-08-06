'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../../errors/CustomError';
import { getLatestSurveyOccurrenceSubmissionSQL } from '../../../../../../../../queries/survey/survey-occurrence-queries';
import { generateS3FileKey, getFileFromS3 } from '../../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../../utils/logger';
import { parseUnknownMedia } from '../../../../../../../../utils/media/media-utils';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/submission/{submissionId}/view');

export const GET: Operation = [getObservationSubmissionCSVForView()];

GET.apiDoc = {
  description: 'Fetches an observation submission csv details for a survey.',
  tags: ['observation_submission_csv'],
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
    },
    {
      in: 'path',
      name: 'submissionId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Observation submission csv details response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  title: 'Observation submission CSV data',
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string'
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

export function getObservationSubmissionCSVForView(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get observation submission csv details', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.submissionId) {
      throw new HTTP400('Missing required path param `submissionId`');
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

      const fileName = (observationSubmissionData && observationSubmissionData.rows && observationSubmissionData.rows[0] && observationSubmissionData.rows[0].file_name) || null;
      
      const s3Key = generateS3FileKey({
        projectId: Number(req.params.projectId),
        surveyId: Number(req.params.surveyId),
        submissionId: Number(req.params.submissionId),
        fileName
      });

      const s3File = await getFileFromS3(s3Key);

      const mediaFiles = parseUnknownMedia(s3File);

      return res.status(200).json(mediaFiles);
    } catch (error) {
      defaultLog.debug({ label: 'getObservationSubmissionCSVForView', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
