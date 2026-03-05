import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../database/db';
import { PlatformService } from '../../../../services/platform-service';
import { getLogger } from '../../../../utils/logger';
import { resolveSubmissionToSurvey, submissionAuthorizeRequestHandler } from '../../resolveSubmissionToSurvey';

const defaultLog = getLogger('paths/submission/{submissionId}/upload/{submissionUploadId}');

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
