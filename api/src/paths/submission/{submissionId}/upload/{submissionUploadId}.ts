import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { HistoryPublishService } from '../../../../services/history-publish-service';
import { PlatformService } from '../../../../services/platform-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/submission/{submissionId}/upload/{submissionUploadId}');

export const resolveSubmissionToSurvey: RequestHandler = async (req, res, next) => {
  const submissionId = req.params.submissionId as string;
  if (!submissionId) {
    return res.status(400).json({ message: 'submissionId is required' });
  }

  const connection = getDBConnection(req.keycloak_token);
  try {
    await connection.open();
    const historyPublishService = new HistoryPublishService(connection);
    const record = await historyPublishService.findSurveyMetadataPublishRecordBySubmissionUuid(submissionId);
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

export function getSubmissionAuthRequestHandler(req: Request) {
  return {
    or: [
      {
        validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
        surveyId: req.survey_id_for_submission!,
        discriminator: 'ProjectPermission' as const
      },
      {
        validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        discriminator: 'SystemRole' as const
      }
    ]
  };
}

export const submissionAuthorizeRequestHandler = authorizeRequestHandler(getSubmissionAuthRequestHandler);

export const DELETE: Operation = [
  resolveSubmissionToSurvey,
  submissionAuthorizeRequestHandler,
  deleteSubmissionUpload()
];

DELETE.apiDoc = {
  description: 'Soft-delete a submission upload in BioHub (only when status is submitted).',
  tags: ['submission'],
  security: [{ Bearer: [] }],
  parameters: [
    { in: 'path', name: 'submissionId', required: true, schema: { type: 'string', format: 'uuid' } },
    { in: 'path', name: 'submissionUploadId', required: true, schema: { type: 'string', format: 'uuid' } }
  ],
  responses: {
    204: { description: 'Submission upload deleted.' },
    404: { description: 'Submission not found' },
    401: { $ref: '#/components/responses/401' },
    403: { $ref: '#/components/responses/403' },
    500: { $ref: '#/components/responses/500' }
  }
};

export function deleteSubmissionUpload(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);
    const submissionId = req.params.submissionId as string;
    const submissionUploadId = req.params.submissionUploadId as string;

    try {
      await connection.open();
      const platformService = new PlatformService(connection);
      await platformService.deleteSubmissionUpload(submissionId, submissionUploadId);
      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteSubmissionUpload', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
