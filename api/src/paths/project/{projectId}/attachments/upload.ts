import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ATTACHMENT_TYPE } from '../../../../constants/attachments';
import { PROJECT_ROLE } from '../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { queries } from '../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { generateS3FileKey, scanFileForVirus, uploadFileToS3 } from '../../../../utils/file-utils';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/upload');

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
  description: 'Upload a project-specific attachment.',
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
    }
  ],
  requestBody: {
    description: 'Attachment upload post request object.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          required: ['media'],
          properties: {
            media: {
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
 * Also adds the metadata to the project_attachment DB table
 * Does nothing if no media is present in the request.
 *
 *
 * @returns {RequestHandler}
 */
export function uploadMedia(): RequestHandler {
  return async (req, res) => {
    const rawMediaArray: Express.Multer.File[] = req.files as Express.Multer.File[];

    if (!req.params.projectId) {
      throw new HTTP400('Missing projectId');
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
      message: 'file',
      file: { ...rawMediaFile, buffer: 'Too big to print' }
    });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      // Scan file for viruses using ClamAV
      const virusScanResult = await scanFileForVirus(rawMediaFile);

      if (!virusScanResult) {
        throw new HTTP400('Malicious content detected, upload cancelled');
      }

      const upsertResult = await upsertProjectAttachment(
        rawMediaFile,
        Number(req.params.projectId),
        ATTACHMENT_TYPE.OTHER,
        connection
      );

      // Upload file to S3
      const metadata = {
        filename: rawMediaFile.originalname,
        username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
        email: (req['auth_payload'] && req['auth_payload'].email) || ''
      };

      await uploadFileToS3(rawMediaFile, upsertResult.key, metadata);

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

export const upsertProjectAttachment = async (
  file: Express.Multer.File,
  projectId: number,
  attachmentType: string,
  connection: IDBConnection
): Promise<{ id: number; revision_count: number; key: string }> => {
  const getSqlStatement = queries.project.getProjectAttachmentByFileNameSQL(projectId, file.originalname);

  if (!getSqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const key = generateS3FileKey({ projectId: projectId, fileName: file.originalname });

  const getResponse = await connection.query(getSqlStatement.text, getSqlStatement.values);

  let attachmentResult: { id: number; revision_count: number };

  if (getResponse && getResponse.rowCount > 0) {
    // Existing attachment with matching name found, update it
    attachmentResult = await updateProjectAttachment(file, projectId, attachmentType, connection);
  } else {
    // No matching attachment found, insert new attachment
    attachmentResult = await insertProjectAttachment(file, projectId, attachmentType, key, connection);
  }

  return { ...attachmentResult, key };
};

export const insertProjectAttachment = async (
  file: Express.Multer.File,
  projectId: number,
  attachmentType: string,
  key: string,
  connection: IDBConnection
): Promise<{ id: number; revision_count: number }> => {
  const sqlStatement = queries.project.postProjectAttachmentSQL(
    file.originalname,
    file.size,
    attachmentType,
    projectId,
    key
  );

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to insert project attachment data');
  }

  return response.rows[0];
};

export const updateProjectAttachment = async (
  file: Express.Multer.File,
  projectId: number,
  attachmentType: string,
  connection: IDBConnection
): Promise<{ id: number; revision_count: number }> => {
  const sqlStatement = queries.project.putProjectAttachmentSQL(projectId, file.originalname, attachmentType);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to update project attachment data');
  }

  return response.rows[0];
};
