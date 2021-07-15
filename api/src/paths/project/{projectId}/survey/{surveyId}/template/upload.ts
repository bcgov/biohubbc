'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/CustomError';
import { postSurveyOccurrenceSubmissionSQL } from '../../../../../../queries/survey/survey-occurrence-queries';
import { generateS3FileKey, uploadFileToS3 } from '../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../utils/logger';
import { logRequest } from '../../../../../../utils/path-utils';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/template/upload');

export const POST: Operation = [
  logRequest('paths/project/{projectId}/survey/{surveyId}/template/upload', 'POST'),
  uploadMedia()
];
POST.apiDoc = {
  description: 'Upload survey template observations file.',
  tags: ['attachments'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
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
    description: 'Survey template file to upload',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            media: {
              description: 'A survey template file.',
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
      description: 'Upload OK'
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
 * Uploads a media file to S3 and inserts a matching record in the `occurrence_submission` table.
 *
 * @return {*}  {RequestHandler}
 */
export function uploadMedia(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'uploadMedia', message: 'files.length', files: req?.files?.length });

    if (!req.files || !req.files.length) {
      // no media objects included
      throw new HTTP400('Missing upload data');
    }

    if (req.files.length !== 1) {
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
      const rawMediaArray: Express.Multer.File[] = req.files as Express.Multer.File[];

      const rawMediaFile = rawMediaArray[0];

      const key = generateS3FileKey({
        projectId: Number(req.params.projectId),
        surveyId: Number(req.params.surveyId),
        fileName: rawMediaFile.originalname
      });

      await connection.open();

      await insertSurveyOccurrenceSubmission(Number(req.params.surveyId), 'BioHub', key, connection);

      const metadata = {
        username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
        email: (req['auth_payload'] && req['auth_payload'].email) || ''
      };

      await uploadFileToS3(rawMediaFile, key, metadata);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.debug({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw new HTTP400('Upload was not successful');
    } finally {
      connection.release();
    }
  };
}

/**
 * Inserts a new record into the `occurrence_submission` table.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} key
 * @param {IDBConnection} connection
 * @return {*}  {Promise<void>}
 */
export const insertSurveyOccurrenceSubmission = async (
  surveyId: number,
  source: string,
  key: string,
  connection: IDBConnection
): Promise<void> => {
  const insertSqlStatement = postSurveyOccurrenceSubmissionSQL(surveyId, source, key);

  if (!insertSqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const insertResponse = await connection.query(insertSqlStatement.text, insertSqlStatement.values);

  if (!insertResponse || !insertResponse.rowCount) {
    throw new HTTP400('Failed to insert survey occurrence submission record');
  }
};
