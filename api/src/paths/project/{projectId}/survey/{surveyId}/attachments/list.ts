import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { GetAttachmentsData, GetReportAttachmentsData } from '../../../../../../models/project-survey-attachments';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../../services/attachment-service';
import { HistoryPublishService } from '../../../../../../services/history-publish-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/list');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
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
            required: ['attachmentsList', 'reportAttachmentsList'],
            properties: {
              attachmentsList: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['attachmentData', 'supplementaryAttachmentData'],
                  properties: {
                    attachmentData: {
                      type: 'object',
                      required: ['fileName', 'lastModified'],
                      properties: {
                        fileName: {
                          description: 'The file name of the attachment',
                          type: 'string'
                        },
                        lastModified: {
                          description: 'The date the object was last modified',
                          type: 'string'
                        }
                      }
                    },
                    supplementaryAttachmentData: {
                      description: 'Survey metadata publish record',
                      type: 'object',
                      nullable: true,
                      required: [
                        'survey_attachment_publish_id',
                        'survey_attachment_id',
                        'event_timestamp',
                        'artifact_revision_id',
                        'create_date',
                        'create_user',
                        'update_date',
                        'update_user',
                        'revision_count'
                      ],
                      properties: {
                        survey_attachment_publish_id: {
                          type: 'integer',
                          minimum: 1
                        },
                        survey_attachment_id: {
                          type: 'integer',
                          minimum: 1
                        },
                        event_timestamp: {
                          oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                          description: 'ISO 8601 date string for the project start date'
                        },
                        artifact_revision_id: {
                          type: 'integer',
                          minimum: 1
                        },
                        create_date: {
                          oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                          description: 'ISO 8601 date string for the project start date'
                        },
                        create_user: {
                          type: 'integer',
                          minimum: 1
                        },
                        update_date: {
                          oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                          description: 'ISO 8601 date string for the project start date'
                        },
                        update_user: {
                          type: 'integer',
                          minimum: 1
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
                type: 'array',
                items: {
                  type: 'object',
                  required: ['attachmentData', 'supplementaryAttachmentData'],
                  properties: {
                    attachmentData: {
                      type: 'object',
                      required: ['fileName', 'lastModified'],
                      properties: {
                        fileName: {
                          description: 'The file name of the attachment',
                          type: 'string'
                        },
                        lastModified: {
                          description: 'The date the object was last modified',
                          type: 'string'
                        }
                      }
                    },
                    supplementaryAttachmentData: {
                      description: 'Survey metadata publish record',
                      type: 'object',
                      nullable: true,
                      required: [
                        'survey_report_publish_id',
                        'survey_report_attachment_id',
                        'event_timestamp',
                        'artifact_revision_id',
                        'create_date',
                        'create_user',
                        'update_date',
                        'update_user',
                        'revision_count'
                      ],
                      properties: {
                        survey_report_publish_id: {
                          type: 'integer',
                          minimum: 1
                        },
                        survey_report_attachment_id: {
                          type: 'integer',
                          minimum: 1
                        },
                        event_timestamp: {
                          oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                          description: 'ISO 8601 date string for the project start date'
                        },
                        artifact_revision_id: {
                          type: 'integer',
                          minimum: 1
                        },
                        create_date: {
                          oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                          description: 'ISO 8601 date string for the project start date'
                        },
                        create_user: {
                          type: 'integer',
                          minimum: 1
                        },
                        update_date: {
                          oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                          description: 'ISO 8601 date string for the project start date'
                        },
                        update_user: {
                          type: 'integer',
                          minimum: 1
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

    const connection = getDBConnection(req['keycloak_token']);
    const surveyId = Number(req.params.surveyId);

    try {
      await connection.open();

      const attachmentService = new AttachmentService(connection);
      const historyPublishService = new HistoryPublishService(connection);

      const attachmentsData = await attachmentService.getSurveyAttachments(surveyId);

      const [attachmentSupplementaryData] = await Promise.all(
        attachmentsData.map(async (attachment) => {
          return historyPublishService.getSurveyAttachmentPublishRecord(attachment.survey_attachment_id);
        })
      );

      const reportAttachmentsData = await attachmentService.getSurveyReportAttachments(surveyId);

      const [reportAttachmentSupplementaryData] = await Promise.all(
        reportAttachmentsData.map(async (attachment) => {
          return historyPublishService.getSurveyReportPublishRecord(attachment.survey_report_attachment_id);
        })
      );

      await connection.commit();

      const getAttachmentsData = new GetAttachmentsData(attachmentsData, attachmentSupplementaryData);
      const getReportAttachmentsData = new GetReportAttachmentsData(
        reportAttachmentsData,
        reportAttachmentSupplementaryData
      );

      return res.status(200).json({ getAttachmentsData, getReportAttachmentsData });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyAttachments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
