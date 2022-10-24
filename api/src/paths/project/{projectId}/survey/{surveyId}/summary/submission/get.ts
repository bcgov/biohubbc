import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { ISummarySubmissionMessagesResponse } from '../../../../../../../repositories/summary-repository';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { SummaryService } from '../../../../../../../services/summary-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/summary/submission/get');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
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
            type: 'object',
            nullable: true,
            properties: {
              id: {
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

export function getSurveySummarySubmission(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get a survey summary result', message: 'params', req_params: req.params });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);
    const surveyId = Number(req.params.surveyId)
  
    try {
      await connection.open();
      const summaryService = new SummaryService(connection)
      
      const summarySubmissionDetails = await summaryService.getLatestSurveySummarySubmission(surveyId)

      if (!summarySubmissionDetails || summarySubmissionDetails.delete_timestamp) {
        return res.status(200).json(null);
      }

      let messageList: ISummarySubmissionMessagesResponse[] = [];
      const errorStatus = summarySubmissionDetails.submission_message_class_name;

      if (errorStatus === 'Error') {
        const summary_submission_id = summarySubmissionDetails.id;
        messageList = await summaryService.getSummarySubmissionMessages(summary_submission_id)
      }

      await connection.commit();

      const getSummarySubmissionData = {
        id: summarySubmissionDetails.id,
        fileName: summarySubmissionDetails.file_name,
        messages: messageList
      } || null;

      return res.status(200).json(getSummarySubmissionData);
    } catch (error) {
      defaultLog.error({ label: 'getSummarySubmissionData', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
