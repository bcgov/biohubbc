import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/custom-error';
import {
  IReportAttachmentAuthor,
  PostReportAttachmentMetadata,
  PutReportAttachmentMetadata
} from '../../../../../../../models/project-survey-attachments';
import { queries } from '../../../../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { generateS3FileKey, scanFileForVirus, uploadFileToS3 } from '../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/report/upload');

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
  uploadMedia()
];
POST.apiDoc = {
  description: 'Upload a survey-specific report.',
  tags: ['attachment'],
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
    description: 'Attachment upload post request object.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          required: ['media', 'attachmentMeta'],
          properties: {
            media: {
              type: 'string',
              format: 'binary'
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
      description: 'Report upload response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            description: 'The S3 unique key for this file.',
            required: ['attachmentId', 'revision_count'],
            properties: {
              attachmentId: {
                type: 'number'
              },
              revision_count: {
                type: 'number'
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

    if (!req.body) {
      throw new HTTP400('Missing request body');
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

      const upsertResult = await upsertSurveyReportAttachment(
        rawMediaFile,
        Number(req.params.projectId),
        Number(req.params.surveyId),
        req.body.attachmentMeta,
        connection
      );

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

export const upsertSurveyReportAttachment = async (
  file: Express.Multer.File,
  projectId: number,
  surveyId: number,
  attachmentMeta: any,
  connection: IDBConnection
): Promise<{ id: number; revision_count: number; key: string }> => {
  const getSqlStatement = queries.survey.getSurveyReportAttachmentByFileNameSQL(surveyId, file.originalname);

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
  const sqlStatement = queries.survey.postSurveyReportAttachmentSQL(
    file.originalname,
    file.size,
    surveyId,
    key,
    attachmentMeta
  );

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
  const sqlStatement = queries.survey.putSurveyReportAttachmentSQL(surveyId, file.originalname, attachmentMeta);

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
  const sqlStatement = queries.survey.deleteSurveyReportAttachmentAuthorsSQL(attachmentId);

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
  const sqlStatement = queries.survey.insertSurveyReportAttachmentAuthorSQL(attachmentId, author);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert attachment report author statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to insert attachment report author record');
  }
};
