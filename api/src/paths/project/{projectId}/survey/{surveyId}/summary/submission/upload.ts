import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { queries } from '../../../../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { generateS3FileKey, scanFileForVirus, uploadFileToS3 } from '../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../utils/logger';
import { ICsvState, IHeaderError, IRowError } from '../../../../../../../utils/media/csv/csv-file';
import { IMediaState, MediaFile } from '../../../../../../../utils/media/media-file';
import { parseUnknownMedia } from '../../../../../../../utils/media/media-utils';
import { ValidationSchemaParser } from '../../../../../../../utils/media/validation/validation-schema-parser';
import { XLSXCSV } from '../../../../../../../utils/media/xlsx/xlsx-file';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/summary/upload');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  uploadAndValidate(),
  returnSummarySubmissionId()
];

POST.apiDoc = {
  description: 'Upload survey summary results file.',
  tags: ['results'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      required: true
    }
  ],
  requestBody: {
    description: 'Survey summary results file to upload',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            media: {
              description: 'A survey summary file.',
              type: 'string',
              format: 'binary'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Upload OK',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              summarySubmissionId: {
                type: 'number'
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

/**
 * Uploads a media file to S3 and inserts a matching record in the `summary_submission` table,
 * then validates the submission.
 *
 * @return {*}  {RequestHandler}
 */
function uploadAndValidate(): RequestHandler {
  return async (req, res, next) => {
    const rawMediaArray: Express.Multer.File[] = req.files as Express.Multer.File[];

    if (!rawMediaArray || !rawMediaArray.length) {
      // no media objects included, skipping media upload step
      throw new HTTP400('Missing upload data');
    }

    defaultLog.debug({
      label: 'uploadMedia',
      message: 'files',
      files: rawMediaArray.map((item) => {
        return { ...item, buffer: 'Too big to print' };
      })
    });

    if (rawMediaArray.length !== 1) {
      // no media objects included
      throw new HTTP400('Too many files uploaded, expected 1');
    }

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param: projectId');
    }

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param: surveyId');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const rawMediaFile = rawMediaArray[0];

      await connection.open();

      // Scan file for viruses using ClamAV
      const virusScanResult = await scanFileForVirus(rawMediaFile);

      if (!virusScanResult) {
        throw new HTTP400('Malicious content detected, upload cancelled');
      }

      const response = await insertSurveySummarySubmission(
        Number(req.params.surveyId),
        'BioHub',
        rawMediaFile.originalname,
        connection
      );

      const summarySubmissionId = response.rows[0].id;

      const key = generateS3FileKey({
        projectId: Number(req.params.projectId),
        surveyId: Number(req.params.surveyId),
        folder: `summaryresults/${summarySubmissionId}`,
        fileName: rawMediaFile.originalname
      });

      await updateSurveySummarySubmissionWithKey(summarySubmissionId, key, connection);

      await connection.commit();

      const metadata = {
        filename: rawMediaFile.originalname,
        username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
        email: (req['auth_payload'] && req['auth_payload'].email) || ''
      };

      await uploadFileToS3(rawMediaFile, key, metadata);

      req['s3File'] = rawMediaFile;

      req['summarySubmissionId'] = summarySubmissionId;
      next();
    } catch (error) {
      defaultLog.error({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

function returnSummarySubmissionId(): RequestHandler {
  return async (req, res) => {
    const summarySubmissionId = req['summarySubmissionId'];

    return res.status(200).json({ summarySubmissionId });
  };
}
