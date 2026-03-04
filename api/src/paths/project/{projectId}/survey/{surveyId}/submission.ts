import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { PlatformService } from '../../../../../services/platform-service';
import { SurveyService } from '../../../../../services/survey-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/submission');

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  deleteSubmission()
];

DELETE.apiDoc = {
  description:
    '[TEMPORARY] Soft-delete the survey submission (upload) on the BioHub backbone. Uses survey_metadata_publish.submission_uuid and submission_upload_uuid for DELETE /submission/:submissionId/upload/:submissionUploadId.',
  tags: ['survey', 'biohub'],
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
    204: {
      description: 'Submission upload soft-deleted on backbone.'
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
    404: {
      description: 'Survey has no published submission (no submission_uuid).'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function deleteSubmission(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);
      const ids = await surveyService.getBioHubSubmissionIds(surveyId);

      if (!ids) {
        return res.status(404).json({
          name: 'NoSubmission',
          message:
            'Survey has no published submission with both submission_uuid and submission_upload_uuid in survey_metadata_publish.'
        });
      }

      const platformService = new PlatformService(connection);
      await platformService.deleteSubmissionUpload(ids.submission_uuid, ids.submission_upload_uuid);

      await connection.commit();
      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteSubmission', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
