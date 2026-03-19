import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { PlatformService } from '../../../../../../../../services/platform-service';
import { getLogger } from '../../../../../../../../utils/logger';

const defaultLog = getLogger(
  'paths/project/{projectId}/survey/{surveyId}/submission/{submissionId}/upload/{submissionUploadId}'
);

export const DELETE: Operation = [
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
  deleteSubmissionUpload()
];

DELETE.apiDoc = {
  description: 'Soft-delete a submission upload in BioHub (only when status is submitted).',
  tags: ['submission'],
  security: [{ Bearer: [] }],
  parameters: [
    { in: 'path', name: 'projectId', required: true, schema: { type: 'integer', minimum: 1 } },
    { in: 'path', name: 'surveyId', required: true, schema: { type: 'integer', minimum: 1 } },
    { in: 'path', name: 'submissionId', required: true, schema: { type: 'string', format: 'uuid' } },
    { in: 'path', name: 'submissionUploadId', required: true, schema: { type: 'string', format: 'uuid' } }
  ],
  responses: {
    204: { description: 'Submission upload deleted.' },
    404: { description: 'Submission not found for survey' },
    401: { $ref: '#/components/responses/401' },
    403: { $ref: '#/components/responses/403' },
    500: { $ref: '#/components/responses/500' }
  }
};

export function deleteSubmissionUpload(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);
    const surveyId = Number(req.params.surveyId);
    const submissionId = req.params.submissionId as string;
    const submissionUploadId = req.params.submissionUploadId as string;

    try {
      await connection.open();
      const platformService = new PlatformService(connection);
      const deleted = await platformService.deleteSubmissionUploadForSurvey(surveyId, submissionId, submissionUploadId);

      if (!deleted) {
        return res.status(404).json({ message: 'Submission not found for survey' });
      }

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteSubmissionUpload', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
