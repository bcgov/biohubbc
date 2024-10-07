import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../../../../request-handlers/security/authorization';
import { CritterAttachmentService } from '../../../../../../../../../../services/critter-attachment-service';
import { bulkDeleteFilesFromS3 } from '../../../../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../../../../utils/logger';

const defaultLog = getLogger(
  '/api/project/{projectId}/survey/{surveyId}/critters/{critterbaseCaptureId}/captures/{captureId}/attachments'
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
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  deleteCritterCaptureAttachments()
];

DELETE.apiDoc = {
  description: 'Delete all attachments for a critter capture.',
  tags: ['attachment'],
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
    },
    {
      in: 'path',
      name: 'critterbaseCaptureId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'captureId',
      schema: {
        type: 'string',
        format: 'uuid',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Delete OK'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Delete all attachments for a critter capture.
 *
 * @returns {RequestHandler}
 */
export function deleteCritterCaptureAttachments(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const captureId = req.params.captureId;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const critterAttachmentService = new CritterAttachmentService(connection);

      // Get all attachments for the critter capture
      const attachments = await critterAttachmentService.findAllCritterCaptureAttachments(surveyId, captureId);

      // Get the S3 keys and attachmentIds for the attachments
      const s3Keys = attachments.map((attachment) => attachment.key);
      const attachmentIds = attachments.map((attachment) => attachment.critter_capture_attachment_id);

      // Delete the attachments from the database
      await critterAttachmentService.deleteCritterCaptureAttachments(surveyId, attachmentIds);

      // Delete the attachments from S3
      await bulkDeleteFilesFromS3(s3Keys);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteCritterCaptureAttachments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
