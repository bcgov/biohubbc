'use strict';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ATTACHMENT_TYPE } from '../../../../../../constants/attachments';
import { SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/CustomError';
import {
  getSurveyAttachmentByFileNameSQL,
  getSurveyReportAttachmentByFileNameSQL,
  postSurveyAttachmentSQL,
  postSurveyReportAttachmentSQL,
  putSurveyAttachmentSQL,
  putSurveyReportAttachmentSQL,
  deleteSurveyReportAttachmentAuthorsSQL,
  insertSurveyReportAttachmentAuthorSQL
} from '../../../../../../queries/survey/survey-attachments-queries';
import { generateS3FileKey, scanFileForVirus, uploadFileToS3 } from '../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../utils/logger';
import {
  PostReportAttachmentMetadata,
  PutReportAttachmentMetadata,
  IReportAttachmentAuthor
} from '../../../../../../models/project-survey-attachments';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/upload');

export const POST: Operation = [uploadMedia()];
POST.apiDoc = {
  description: 'Upload a survey-specific attachment.',
  tags: ['attachment'],
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
    description: 'Attachment upload post request object.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          required: ['attachmentType', 'attachmentMeta'],
          properties: {
            media: {
              type: 'string',
              format: 'binary'
            },
            attachmentType: {
              type: 'string',
              enum: ['Report', 'Other']
            },
            attachmentMeta: {
              type: 'object',
              required: ['title', 'year_published', 'authors', 'description'],
              properties: {
                title: {
                  type: 'string'
                },
                year_published: {
                  type: 'string'
                },
                authors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['first_name', 'last_name'],
                    properties: {
                      first_name: {
                        type: 'string'
                      },
                      last_name: {
                        type: 'string'
                      }
                    }
                  }
                },
                description: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Attachment upload response.',
      content: {
        'application/json': {
          schema: {
            type: 'string',
            description: 'The S3 unique key for this file.'
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

    if (!req.params.projectId) {
      throw new HTTP400('Missing projectId');
    }

    if (!req.params.surveyId) {
      throw new HTTP400('Missing surveyId');
    }

    if (!rawMediaArray || !rawMediaArray.length) {
      // no media objects included, skipping media upload step
      throw new HTTP400('Missing upload data');
    }

    if (!req.body || !req.body.attachmentType) {
      throw new HTTP400('Missing attachment file type');
    }

    const rawMediaFile: Express.Multer.File = rawMediaArray[0];

    defaultLog.debug({
      label: 'uploadMedia',
      message: 'files',
      files: { ...rawMediaFile, buffer: 'Too big to print' }
    });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      // Scan file for viruses using ClamAV
      const virusScanResult = await scanFileForVirus(rawMediaFile);

      if (!virusScanResult) {
        throw new HTTP400('Malicious content detected, upload cancelled');
      }

      // Insert file metadata into project_attachment or _report_attachment table
      let upsertResult;
      if (req.body.attachmentType === ATTACHMENT_TYPE.REPORT) {
        upsertResult = await upsertSurveyReportAttachment(
          rawMediaFile,
          Number(req.params.projectId),
          Number(req.params.surveyId),
          req.body.attachmentMeta,
          connection
        );
      } else {
        upsertResult = await upsertSurveyAttachment(
          rawMediaFile,
          Number(req.params.projectId),
          Number(req.params.surveyId),
          req.body.attachmentType,
          connection
        );
      }

      const metadata = {
        filename: rawMediaFile.originalname,
        username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
        email: (req['auth_payload'] && req['auth_payload'].email) || ''
      };

      const result = await uploadFileToS3(rawMediaFile, upsertResult.key, metadata);

      defaultLog.debug({ label: 'uploadMedia', message: 'result', result });

      await connection.commit();

      return res.status(200).json({ attachmentId: upsertResult.id, revision_count: upsertResult.revision_count });
    } catch (error) {
      defaultLog.error({ label: 'uploadMedia', message: 'error', error });
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
  attachmentType: string,
  connection: IDBConnection
): Promise<{ id: number; revision_count: number; key: string }> => {
  const getSqlStatement = getSurveyAttachmentByFileNameSQL(surveyId, file.originalname);

  if (!getSqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const key = generateS3FileKey({ projectId: projectId, surveyId: surveyId, fileName: file.originalname });

  const getResponse = await connection.query(getSqlStatement.text, getSqlStatement.values);

  let attachmentResult: { id: number; revision_count: number };

  if (getResponse && getResponse.rowCount > 0) {
    // Existing attachment with matching name found, update it
    attachmentResult = await updateSurveyAttachment(file, surveyId, attachmentType, connection);
  } else {
    // No matching attachment found, insert new attachment
    attachmentResult = await insertSurveyAttachment(file, projectId, surveyId, attachmentType, connection);
  }

  return { ...attachmentResult, key };
};

export const insertSurveyAttachment = async (
  file: Express.Multer.File,
  projectId: number,
  surveyId: number,
  attachmentType: string,
  connection: IDBConnection
): Promise<{ id: number; revision_count: number }> => {
  const key = generateS3FileKey({
    projectId: projectId,
    surveyId: surveyId,
    fileName: file.originalname,
    folder: 'reports'
  });

  const sqlStatement = postSurveyAttachmentSQL(file.originalname, file.size, attachmentType, surveyId, key);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to insert survey attachment data');
  }

  return response.rows[0];
};

export const updateSurveyAttachment = async (
  file: Express.Multer.File,
  surveyId: number,
  attachmentType: string,
  connection: IDBConnection
): Promise<{ id: number; revision_count: number }> => {
  const sqlStatement = putSurveyAttachmentSQL(surveyId, file.originalname, attachmentType);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to update survey attachment data');
  }

  return response.rows[0];
};

export const upsertSurveyReportAttachment = async (
  file: Express.Multer.File,
  projectId: number,
  surveyId: number,
  attachmentMeta: any,
  connection: IDBConnection
): Promise<{ id: number; revision_count: number; key: string }> => {
  const getSqlStatement = getSurveyReportAttachmentByFileNameSQL(surveyId, file.originalname);

  if (!getSqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const key = generateS3FileKey({
    projectId: projectId,
    surveyId: surveyId,
    fileName: file.originalname,
    folder: 'reports'
  });

  const getResponse = await connection.query(getSqlStatement.text, getSqlStatement.values);

  let metadata;
  let attachmentResult: { id: number; revision_count: number };

  if (getResponse && getResponse.rowCount > 0) {
    // Existing attachment with matching name found, update it
    metadata = new PutReportAttachmentMetadata(attachmentMeta);
    attachmentResult = await updateSurveyReportAttachment(file, surveyId, metadata, connection);
  } else {
    // No matching attachment found, insert new attachment
    metadata = new PostReportAttachmentMetadata(attachmentMeta);
    attachmentResult = await insertSurveyReportAttachment(
      file,
      surveyId,
      new PostReportAttachmentMetadata(attachmentMeta),
      key,
      connection
    );
  }

  // Delete any existing attachment author records
  await deleteSurveyReportAttachmentAuthors(attachmentResult.id, connection);

  const promises = [];

  // Insert any new attachment author records
  promises.push(
    metadata.authors.map((author) => insertSurveyReportAttachmentAuthor(attachmentResult.id, author, connection))
  );

  await Promise.all(promises);

  return { ...attachmentResult, key };
};

export const insertSurveyReportAttachment = async (
  file: Express.Multer.File,
  surveyId: number,
  attachmentMeta: PostReportAttachmentMetadata,
  key: string,
  connection: IDBConnection
): Promise<{ id: number; revision_count: number }> => {
  const sqlStatement = postSurveyReportAttachmentSQL(file.originalname, file.size, surveyId, key, attachmentMeta);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to insert survey attachment data');
  }

  return response.rows[0];
};

export const updateSurveyReportAttachment = async (
  file: Express.Multer.File,
  surveyId: number,
  attachmentMeta: PutReportAttachmentMetadata,
  connection: IDBConnection
): Promise<{ id: number; revision_count: number }> => {
  const sqlStatement = putSurveyReportAttachmentSQL(surveyId, file.originalname, attachmentMeta);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to update survey attachment data');
  }

  return response.rows[0];
};

export const deleteSurveyReportAttachmentAuthors = async (
  attachmentId: number,
  connection: IDBConnection
): Promise<void> => {
  const sqlStatement = deleteSurveyReportAttachmentAuthorsSQL(attachmentId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL delete attachment report authors statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response) {
    throw new HTTP400('Failed to delete attachment report authors records');
  }
};

export const insertSurveyReportAttachmentAuthor = async (
  attachmentId: number,
  author: IReportAttachmentAuthor,
  connection: IDBConnection
): Promise<void> => {
  const sqlStatement = insertSurveyReportAttachmentAuthorSQL(attachmentId, author);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert attachment report author statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to insert attachment report author record');
  }
};
