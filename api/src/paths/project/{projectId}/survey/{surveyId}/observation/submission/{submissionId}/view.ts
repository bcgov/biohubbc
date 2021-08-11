'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { HTTP400, HTTP500 } from '../../../../../../../../errors/CustomError';
import { getSurveyOccurrenceSubmissionSQL } from '../../../../../../../../queries/survey/survey-occurrence-queries';
import { generateS3FileKey, getFileFromS3 } from '../../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../../utils/logger';
import { XLSXCSV } from '../../../../../../../../utils/media/csv/csv-file';
import { DWCArchive } from '../../../../../../../../utils/media/csv/dwc/dwc-archive-file';
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
                    },
                    headers: {
                      type: 'array'
                    },
                    rows: {
                      type: 'array'
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
      const getSubmissionSQLStatement = getSurveyOccurrenceSubmissionSQL(Number(req.params.submissionId));

      if (!getSubmissionSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const submissionData = await connection.query(getSubmissionSQLStatement.text, getSubmissionSQLStatement.values);

      await connection.commit();

      const fileName =
        (submissionData && submissionData.rows && submissionData.rows[0] && submissionData.rows[0].file_name) || null;

      const s3Key = generateS3FileKey({
        projectId: Number(req.params.projectId),
        surveyId: Number(req.params.surveyId),
        submissionId: Number(req.params.submissionId),
        fileName
      });

      const s3File = await getFileFromS3(s3Key);

      if (!s3File) {
        throw new HTTP500('Failed to retrieve file from S3');
      }

      const mediaFiles = parseUnknownMedia(s3File);

      if (!mediaFiles || !mediaFiles.length) {
        throw new HTTP500('Failed to parse media file');
      }

      const mediaFile = mediaFiles[0];
      let worksheets;
      const data = [];

      // Get the worksheets for the file based on type
      if (mediaFile.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        // xslx
        const xlsxCSV = new XLSXCSV(mediaFile);

        worksheets = xlsxCSV.workbook.worksheets;
      } else {
        // dwc archive
        const dwcArchive = new DWCArchive(mediaFiles);

        worksheets = dwcArchive.worksheets;
      }

      for (const [key] of Object.entries(worksheets)) {
        const dataItem = {
          name: key,
          headers: worksheets[key]?.getHeaders(),
          rows: worksheets[key]?.getRows()
        };

        data.push(dataItem);
      }

      return res.status(200).json({ data });
    } catch (error) {
      defaultLog.debug({ label: 'getObservationSubmissionCSVForView', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
