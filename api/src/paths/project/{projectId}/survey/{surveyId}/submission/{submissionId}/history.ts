import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { PlatformService } from '../../../../../../../services/platform-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/submission/{submissionId}/history');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSubmissionHistory()
];

GET.apiDoc = {
  description: 'Get submission upload history from BioHub.',
  tags: ['submission'],
  security: [{ Bearer: [] }],
  parameters: [
    { in: 'path', name: 'projectId', required: true, schema: { type: 'integer', minimum: 1 } },
    { in: 'path', name: 'surveyId', required: true, schema: { type: 'integer', minimum: 1 } },
    { in: 'path', name: 'submissionId', required: true, schema: { type: 'string', format: 'uuid' } }
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
                submissionId: {
                  type: 'integer',
                  description: 'BioHub submission id for view-in-BioHub link'
                }
              }
            }
          }
        }
      }
    },
    404: { description: 'Submission not found for survey' },
    401: { $ref: '#/components/responses/401' },
    403: { $ref: '#/components/responses/403' },
    500: { $ref: '#/components/responses/500' }
  }
};

export function getSubmissionHistory(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);
    const surveyId = Number(req.params.surveyId);
    const submissionId = req.params.submissionId as string;

    try {
      await connection.open();
      const platformService = new PlatformService(connection);
      const history = await platformService.getSubmissionHistoryForSurvey(surveyId, submissionId);

      if (!history) {
        return res.status(404).json({ message: 'Submission not found for survey' });
      }

      return res.status(200).json(history);
    } catch (error) {
      defaultLog.error({ label: 'getSubmissionHistory', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
