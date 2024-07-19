import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../services/attachment-service';
import { SurveyService } from '../../../../../services/survey-service';
import { deleteFileFromS3 } from '../../../../../utils/file-utils';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/delete');

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
  deleteSurvey()
];

DELETE.apiDoc = {
  description: 'Delete a survey.',
  tags: ['survey'],
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
      description: 'Boolean true value representing successful deletion.',
      content: {
        'application/json': {
          schema: {
            title: 'Survey delete response',
            type: 'boolean'
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function deleteSurvey(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();
      /**
       * PART 1
       * Get the attachment S3 keys for all attachments associated to this survey
       * Used to delete them from S3 separately later
       */
      const attachmentService = new AttachmentService(connection);

      const surveyAttachments = await attachmentService.getSurveyAttachments(surveyId);
      const surveyAttachmentS3Keys: string[] = surveyAttachments.map((attachment) => attachment.key);

      /**
       * PART 2
       * Delete the survey and all associated records/resources from our DB
       */
      const surveyService = new SurveyService(connection);
      await surveyService.deleteSurvey(surveyId);

      /**
       * PART 3
       * Delete the survey attachments from S3
       */
      const deleteResult = await Promise.all(surveyAttachmentS3Keys.map((s3Key: string) => deleteFileFromS3(s3Key)));

      if (deleteResult.some((deleteResult) => !deleteResult)) {
        return res.status(200).json(null);
      }

      await connection.commit();

      return res.status(200).json(true);
    } catch (error) {
      defaultLog.error({ label: 'deleteSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
