import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../../../../request-handlers/security/authorization';
import { OccurrenceService } from '../../../../../../../../../services/occurrence-service';
import { getS3SignedURL } from '../../../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../../../utils/logger';
import { attachmentApiDocObject } from '../../../../../../../../../utils/shared-api-docs';

const defaultLog = getLogger(
  '/api/project/{projectId}/survey/{surveyId}/dwca/observations/submission/{submissionId}/getSignedUrl'
);

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSingleSubmissionURL()
];

GET.apiDoc = {
  ...attachmentApiDocObject(
    'Retrieves the signed url of observation submission in a survey by its submission id.',
    'GET response containing the signed url of a submission.'
  ),
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
    },
    {
      in: 'path',
      name: 'submissionId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Obsesrvation submission signed URL response.',
      content: {
        'application/json': {
          schema: {
            type: 'string'
          }
        }
      }
    }
  }
};

export function getSingleSubmissionURL(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get single submission url', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.submissionId) {
      throw new HTTP400('Missing required path param `submissionId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();
      const occurrenceService = new OccurrenceService(connection);

      const result = await occurrenceService.getOccurrenceSubmission(Number(req.params.submissionId));

      await connection.commit();

      const s3SignedUrl = await getS3SignedURL(result.input_key);

      if (!s3SignedUrl) {
        return res.status(200).json(null);
      }

      return res.status(200).json(s3SignedUrl);
    } catch (error) {
      defaultLog.error({ label: 'getSingleSubmissionURL', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
