'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ATTACHMENT_TYPE } from '../../../../../../../../constants/attachments';
import { SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../../errors/CustomError';
import { PutReportAttachmentMetadata } from '../../../../../../../../models/project-survey-attachments';
import { updateSurveyReportAttachmentMetadataSQL } from '../../../../../../../../queries/survey/survey-attachments-queries';
import { getLogger } from '../../../../../../../../utils/logger';
import { deleteSurveyReportAttachmentAuthors, insertSurveyReportAttachmentAuthor } from '../../upload';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/metadata/update');

export const PUT: Operation = [updateSurveyAttachmentMetadata()];

PUT.apiDoc = {
  description: 'Update project attachment metadata.',
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
      schema: {
        type: 'number'
      },
      required: true
    },
    {
      in: 'path',
      name: 'attachmentId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          description: 'Attachment metadata for attachments of type: Report.',
          required: ['attachment_type', 'attachment_meta', 'revision_count'],
          properties: {
            attachment_type: {
              type: 'string',
              enum: ['Report']
            },
            attachment_meta: {
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
            },
            revision_count: {
              type: 'number'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Update project attachment metadata OK'
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

export function updateSurveyAttachmentMetadata(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'updateProjectAttachmentMetadata',
      message: 'params',
      req_params: req.params,
      req_body: req.body
    });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    if (!Object.values(ATTACHMENT_TYPE).includes(req.body?.attachment_type)) {
      throw new HTTP400('Invalid body param `attachment_type`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      if (req.body.attachment_type === ATTACHMENT_TYPE.REPORT) {
        const metadata = new PutReportAttachmentMetadata({
          ...req.body.attachment_meta,
          revision_count: req.body.revision_count
        });

        // Update the metadata fields of the attachment record
        await updateSurveyReportAttachmentMetadata(
          Number(req.params.projectId),
          Number(req.params.attachmentId),
          metadata,
          connection
        );

        // Delete any existing attachment author records
        await deleteSurveyReportAttachmentAuthors(Number(req.params.attachmentId), connection);

        const promises = [];

        // Insert any new attachment author records
        promises.push(
          metadata.authors.map((author) =>
            insertSurveyReportAttachmentAuthor(Number(req.params.attachmentId), author, connection)
          )
        );

        await Promise.all(promises);
      }

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'updateProjectAttachmentMetadata', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

const updateSurveyReportAttachmentMetadata = async (
  projectId: number,
  attachmentId: number,
  metadata: PutReportAttachmentMetadata,
  connection: IDBConnection
): Promise<void> => {
  const sqlStatement = updateSurveyReportAttachmentMetadataSQL(projectId, attachmentId, metadata);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update attachment report statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to update attachment report record');
  }
};
