import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { HistoryPublishService } from '../../../services/history-publish-service';
import { PlatformService } from '../../../services/platform-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/submission/{submissionId}/history');

/**
 * Middleware that resolves submissionId (UUID) to survey_id and sets req.survey_id_for_submission for authorization.
 */
const resolveSubmissionToSurvey: RequestHandler = async (req, res, next) => {
  const submissionId = req.params.submissionId as string;
  if (!submissionId) {
    return res.status(400).json({ message: 'submissionId is required' });
  }

  const connection = getDBConnection(req.keycloak_token);
  try {
    await connection.open();
    const historyPublishService = new HistoryPublishService(connection);
    const record = await historyPublishService.getSurveyMetadataPublishRecordBySubmissionUuid(submissionId);
    if (!record) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    req.survey_id_for_submission = record.survey_id;
    next();
  } catch (error) {
    defaultLog.error({ label: 'resolveSubmissionToSurvey', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
};

export const GET: Operation = [
  resolveSubmissionToSurvey,
  authorizeRequestHandler((req: Request) => ({
    or: [
      {
        validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
        surveyId: req.survey_id_for_submission!,
        discriminator: 'ProjectPermission'
      },
      {
        validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        discriminator: 'SystemRole'
      }
    ]
  })),
  getSubmissionHistory()
];

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

function getSubmissionHistory(): RequestHandler {
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
