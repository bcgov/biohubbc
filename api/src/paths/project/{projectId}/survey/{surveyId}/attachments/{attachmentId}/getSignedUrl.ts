import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import {
  ATTACHMENT_TYPE,
  CRITTER_CAPTURE_ATTACHMENT_TYPE,
  TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE
} from '../../../../../../../constants/attachments';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../../../services/attachment-service';
import { CritterAttachmentService } from '../../../../../../../services/critter-attachment-service';
import { getS3SignedURL } from '../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/{attachmentId}/getSignedUrl');

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
  getSurveyAttachmentSignedURL()
];

GET.apiDoc = {
  description: 'Retrieves the signed url of a survey attachment.',
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
      name: 'attachmentId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'query',
      name: 'attachmentType',
      schema: {
        type: 'string',
        enum: [
          ATTACHMENT_TYPE.REPORT,
          ATTACHMENT_TYPE.OTHER,
          TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG,
          TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
          CRITTER_CAPTURE_ATTACHMENT_TYPE.CAPTURE,
          CRITTER_CAPTURE_ATTACHMENT_TYPE.MORTALITY
        ]
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Response containing the signed url of an attachment.',
      content: {
        'text/plain': {
          schema: {
            type: 'string'
          }
        }
      }
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
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function getSurveyAttachmentSignedURL(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'getSurveyAttachmentSignedURL',
      message: 'params',
      req_params: req.params,
      req_query: req.query,
      req_body: req.body
    });

    const surveyId = Number(req.params.surveyId);
    const attachmentId = Number(req.params.attachmentId);
    const attachmentType = req.query.attachmentType;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      let s3Key;

      const attachmentService = new AttachmentService(connection);
      const critterAttachmentService = new CritterAttachmentService(connection);

      switch (attachmentType) {
        case CRITTER_CAPTURE_ATTACHMENT_TYPE.CAPTURE:
          s3Key = await critterAttachmentService.getCritterCaptureAttachmentS3Key(surveyId, attachmentId);
          break;
        case ATTACHMENT_TYPE.REPORT:
          s3Key = await attachmentService.getSurveyReportAttachmentS3Key(surveyId, attachmentId);
          break;
        case TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX || TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG:
          s3Key = await attachmentService.getSurveyTelemetryCredentialAttachmentS3Key(surveyId, attachmentId);
          break;
        default:
          s3Key = await attachmentService.getSurveyAttachmentS3Key(surveyId, attachmentId);
      }

      await connection.commit();

      const s3SignedUrl = await getS3SignedURL(s3Key);

      if (!s3SignedUrl) {
        return res.status(200).json(null);
      }

      return res.status(200).json(s3SignedUrl);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyAttachmentSignedURL', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
