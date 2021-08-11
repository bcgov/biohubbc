'use strict';

import { ManagedUpload } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/CustomError';
import {
  getSurveyAttachmentByFileNameSQL,
  postSurveyAttachmentSQL,
  putSurveyAttachmentSQL
} from '../../../../../../queries/survey/survey-attachments-queries';
import { generateS3FileKey, uploadFileToS3 } from '../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/upload');

export const POST: Operation = [uploadMedia()];
POST.apiDoc = {
  description: 'Upload survey-specific attachments.',
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
    description: 'Attachments upload post request object.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            media: {
              type: 'array',
              description: 'An array of attachments to upload',
              items: {
                type: 'string',
                format: 'binary'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Attachments upload response.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                mediaKey: {
                  type: 'string',
                  description: 'The S3 unique key for this file.'
                },
                lastModified: {
                  type: 'string',
                  description: 'The date the object was last modified'
                }
              }
            }
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Uploads any media in the request to S3, adding their keys to the request.
 * Also adds the metadata to the survey_attachment DB table
 * Does nothing if no media is present in the request.
 *
 * TODO: make media handling an extension that can be added to different endpoints/record types
 *
 * @returns {RequestHandler}
 */
export function uploadMedia(): RequestHandler {
  return async (req, res) => {
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

    if (!req.params.surveyId) {
      throw new HTTP400('Missing surveyId');
    }

    const connection = getDBConnection(req['keycloak_token']);

    // Insert file metadata into survey_attachment table
    try {
      await connection.open();

      const insertSurveyAttachmentsPromises = rawMediaArray.map((file: Express.Multer.File) =>
        upsertSurveyAttachment(file, Number(req.params.projectId), Number(req.params.surveyId), connection)
      );

      await Promise.all([...insertSurveyAttachmentsPromises]);

      // Upload files to S3
      const s3UploadPromises: Promise<ManagedUpload.SendData>[] = [];

      rawMediaArray.forEach((file: Express.Multer.File) => {
        const key = generateS3FileKey({
          projectId: Number(req.params.projectId),
          surveyId: Number(req.params.surveyId),
          fileName: file.originalname
        });

        const metadata = {
          filename: file.originalname,
          username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
          email: (req['auth_payload'] && req['auth_payload'].email) || ''
        };

        s3UploadPromises.push(uploadFileToS3(file, key, metadata));
      });

      const results = await Promise.all(s3UploadPromises);
      defaultLog.debug({ label: 'uploadMedia', message: 'results', results });

      await connection.commit();

      return res.status(200).json(results.map((result) => result.Key));
    } catch (error) {
      defaultLog.debug({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const upsertSurveyAttachment = async (
  file: Express.Multer.File,
  projectId: number,
  surveyId: number,
  connection: IDBConnection
): Promise<number> => {
  const getSqlStatement = getSurveyAttachmentByFileNameSQL(surveyId, file.originalname);

  if (!getSqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const getResponse = await connection.query(getSqlStatement.text, getSqlStatement.values);

  if (getResponse && getResponse.rowCount > 0) {
    const updateSqlStatement = putSurveyAttachmentSQL(surveyId, file.originalname);

    if (!updateSqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const updateResponse = await connection.query(updateSqlStatement.text, updateSqlStatement.values);
    const updateResult = (updateResponse && updateResponse.rowCount) || null;

    if (!updateResult) {
      throw new HTTP400('Failed to update survey attachment data');
    }

    return updateResult;
  }

  const key = generateS3FileKey({ projectId: projectId, surveyId: surveyId, fileName: file.originalname });

  const insertSqlStatement = postSurveyAttachmentSQL(file.originalname, file.size, projectId, surveyId, key);

  if (!insertSqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const insertResponse = await connection.query(insertSqlStatement.text, insertSqlStatement.values);
  const insertResult = (insertResponse && insertResponse.rows && insertResponse.rows[0]) || null;

  if (!insertResult || !insertResult.id) {
    throw new HTTP400('Failed to insert survey attachment data');
  }

  return insertResult.id;
};
