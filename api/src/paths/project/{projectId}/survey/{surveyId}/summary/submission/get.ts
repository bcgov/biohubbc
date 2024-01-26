import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { ISummarySubmissionMessagesResponse } from '../../../../../../../repositories/summary-repository';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { HistoryPublishService } from '../../../../../../../services/history-publish-service';
import { SummaryService } from '../../../../../../../services/summary-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/summary/submission/get');

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
  getSurveySummarySubmission()
];

GET.apiDoc = {
  description: 'Fetches an summary occurrence submission for a survey.',
  tags: ['summary_submission'],
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
    }
  ],
  responses: {
    200: {
      description: 'Summary submission get response.',
      content: {
        'application/json': {
          schema: {
            title: 'Survey get response object, for view purposes',
            type: 'object',
            nullable: true,
            required: ['surveySummaryData', 'surveySummarySupplementaryData'],
            properties: {
              surveySummaryData: {
                type: 'object',
                nullable: true,
                properties: {
                  survey_summary_submission_id: {
                    type: 'number'
                  },
                  fileName: {
                    description: 'The file name of the submission',
                    type: 'string'
                  },
                  messages: {
                    description: 'The validation status messages of the summary submission',
                    type: 'array',
                    items: {
                      type: 'object',
                      description: 'A validation status message of the summary submission'
                    }
                  }
                }
              },
              surveySummarySupplementaryData: {
                description: 'Survey summary submission publish record',
                type: 'object',
                nullable: true,
                required: [
                  'survey_summary_submission_publish_id',
                  'survey_summary_submission_id',
                  'event_timestamp',
                  'artifact_revision_id',
                  'create_date',
                  'create_user',
                  'update_date',
                  'update_user',
                  'revision_count'
                ],
                properties: {
                  survey_summary_submission_publish_id: {
                    type: 'integer',
                    minimum: 1
                  },
                  survey_summary_submission_id: {
                    type: 'integer',
                    minimum: 1
                  },
                  event_timestamp: {
                    oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                    description: 'ISO 8601 date string for the project start date'
                  },
                  artifact_revision_id: {
                    type: 'string'
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
                    description: 'ISO 8601 date string for the project start date',
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

export function getSurveySummarySubmission(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get a survey summary result', message: 'params', req_params: req.params });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);
    const surveyId = Number(req.params.surveyId);

    try {
      await connection.open();
      const summaryService = new SummaryService(connection);
      const historyPublishService = new HistoryPublishService(connection);

      const summarySubmissionDetails = await summaryService.getLatestSurveySummarySubmission(surveyId);

      if (!summarySubmissionDetails || summarySubmissionDetails.delete_timestamp) {
        return res.status(200).json(null);
      }

      let messageList: ISummarySubmissionMessagesResponse[] = [];
      const messageClass = summarySubmissionDetails.submission_message_class_name;

      if (messageClass === 'Error') {
        const summary_submission_id = summarySubmissionDetails.survey_summary_submission_id;
        messageList = await summaryService.getSummarySubmissionMessages(summary_submission_id);
      }

      const surveySummarySupplementaryData = await historyPublishService.getSurveySummarySubmissionPublishRecord(
        summarySubmissionDetails.survey_summary_submission_id
      );

      await connection.commit();

      return res.status(200).json({
        surveySummaryData: {
          survey_summary_submission_id: summarySubmissionDetails.survey_summary_submission_id,
          fileName: summarySubmissionDetails.file_name,
          messages: messageList
        },
        surveySummarySupplementaryData: surveySummarySupplementaryData
      });
    } catch (error) {
      defaultLog.error({ label: 'getSummarySubmissionData', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
