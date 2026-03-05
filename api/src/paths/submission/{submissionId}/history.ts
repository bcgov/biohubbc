import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../database/db';
import { PlatformService } from '../../../services/platform-service';
import { getLogger } from '../../../utils/logger';
import { resolveSubmissionToSurvey, submissionAuthorizeRequestHandler } from '../resolveSubmissionToSurvey';

export { resolveSubmissionToSurvey } from '../resolveSubmissionToSurvey';

const defaultLog = getLogger('paths/submission/{submissionId}/history');

export const GET: Operation = [resolveSubmissionToSurvey, submissionAuthorizeRequestHandler, getSubmissionHistory()];

GET.apiDoc = {
  description: 'Get submission upload history from BioHub.',
  tags: ['submission'],
  security: [{ Bearer: [] }],
  parameters: [
    {
      in: 'path',
      name: 'submissionId',
      required: true,
      schema: { type: 'string', format: 'uuid' }
    }
  ],
  responses: {
    200: {
      description: 'Submission upload history.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              required: ['submissionUploadId', 'status', 'createDate'],
              properties: {
                submissionUploadId: { type: 'string', format: 'uuid' },
                status: { type: 'string' },
                createDate: { type: 'string', format: 'date-time' },
                id: {
                  type: 'integer',
                  description: 'BioHub submission id for view-in-BioHub link'
                }
              }
            }
          }
        }
      }
    },
    404: { description: 'Submission not found' },
    401: { $ref: '#/components/responses/401' },
    403: { $ref: '#/components/responses/403' },
    500: { $ref: '#/components/responses/500' }
  }
};

export function getSubmissionHistory(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);
    const submissionId = req.params.submissionId as string;

    try {
      await connection.open();
      const platformService = new PlatformService(connection);
      const history = await platformService.getSubmissionHistory(submissionId);
      return res.status(200).json(history);
    } catch (error) {
      defaultLog.error({ label: 'getSubmissionHistory', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
