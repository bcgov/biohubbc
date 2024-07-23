import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../../services/attachment-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/list');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveyAttachments()
];

GET.apiDoc = {
  description: 'Fetches a list of attachments of a survey.',
  tags: ['attachments'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey get response file description array.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['attachmentsList', 'reportAttachmentsList'],
            properties: {
              attachmentsList: {
                description: 'List of attachments.',
                type: 'array',
                items: {
                  description: 'Survey attachment data with supplementary data',
                  type: 'object',
                  additionalProperties: false,
                  required: ['id', 'fileName', 'fileType', 'lastModified', 'size', 'supplementaryAttachmentData'],
                  properties: {
                    id: {
                      description: 'Attachment id',
                      type: 'number'
                    },
                    fileName: {
                      description: 'Attachment file name',
                      type: 'string'
                    },
                    fileType: {
                      description: 'Attachment file type',
                      type: 'string'
                    },
                    lastModified: {
                      description: 'Attachment last modified date',
                      type: 'string'
                    },
                    size: {
                      description: 'Attachment file size',
                      type: 'number'
                    },
                    status: {
                      description: 'Attachment publish status',
                      type: 'string'
                    },
                    supplementaryAttachmentData: {
                      description: 'Attachment supplementary data',
                      type: 'object',
                      additionalProperties: false,
                      nullable: true,
                      properties: {
                        survey_attachment_publish_id: {
                          description: 'Attachment publish id',
                          type: 'number'
                        },
                        survey_attachment_id: {
                          description: 'Attachment id',
                          type: 'number'
                        },
                        event_timestamp: {
                          type: 'string',
                          description: 'ISO 8601 date string'
                        },
                        artifact_revision_id: {
                          type: 'string'
                        },
                        create_date: {
                          type: 'string',
                          description: 'ISO 8601 date string'
                        },
                        create_user: {
                          type: 'integer',
                          minimum: 1
                        },
                        update_date: {
                          type: 'string',
                          description: 'ISO 8601 date string',
                          nullable: true
                        },
                        update_user: {
                          type: 'integer',
                          minimum: 1,
                          nullable: true
                        },
                        revision_count: {
                          type: 'integer',
                          minimum: 0
                        }
                      }
                    }
                  }
                }
              },
              reportAttachmentsList: {
                description: 'List of report attachments.',
                type: 'array',
                items: {
                  description: 'Survey attachment data with supplementary data',
                  type: 'object',
                  additionalProperties: false,
                  required: ['id', 'fileName', 'fileType', 'lastModified', 'size', 'supplementaryAttachmentData'],
                  properties: {
                    id: {
                      description: 'Attachment id',
                      type: 'number'
                    },
                    fileName: {
                      description: 'Attachment file name',
                      type: 'string'
                    },
                    fileType: {
                      description: 'Attachment file type',
                      type: 'string'
                    },
                    lastModified: {
                      description: 'Attachment last modified date',
                      type: 'string'
                    },
                    size: {
                      description: 'Attachment file size',
                      type: 'number'
                    },
                    status: {
                      description: 'Attachment publish status',
                      type: 'string'
                    },
                    supplementaryAttachmentData: {
                      description: 'Attachment supplementary data',
                      type: 'object',
                      additionalProperties: false,
                      nullable: true,
                      properties: {
                        survey_report_publish_id: {
                          description: 'Attachment publish id',
                          type: 'number'
                        },
                        survey_report_attachment_id: {
                          description: 'Attachment id',
                          type: 'number'
                        },
                        event_timestamp: {
                          type: 'string',
                          description: 'ISO 8601 date string'
                        },
                        artifact_revision_id: {
                          type: 'string'
                        },
                        create_date: {
                          type: 'string',
                          description: 'ISO 8601 date string'
                        },
                        create_user: {
                          type: 'integer',
                          minimum: 1
                        },
                        update_date: {
                          type: 'string',
                          description: 'ISO 8601 date string',
                          nullable: true
                        },
                        update_user: {
                          type: 'integer',
                          minimum: 1,
                          nullable: true
                        },
                        revision_count: {
                          type: 'integer',
                          minimum: 0
                        }
                      }
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
      $ref: '#/components/responses/403'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function getSurveyAttachments(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get attachments list', message: 'params', req_params: req.params });

    const connection = getDBConnection(req.keycloak_token);
    const surveyId = Number(req.params.surveyId);

    try {
      await connection.open();

      const attachmentService = new AttachmentService(connection);

      const attachmentsData = await attachmentService.getSurveyAttachmentsWithSupplementaryData(surveyId);
      const reportAttachmentsData = await attachmentService.getSurveyReportAttachmentsWithSupplementaryData(surveyId);

      await connection.commit();

      return res.status(200).json({
        attachmentsList: attachmentsData,
        reportAttachmentsList: reportAttachmentsData
      });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyAttachments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
