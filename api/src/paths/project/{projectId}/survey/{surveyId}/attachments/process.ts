import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { AttachmentKeyxService } from '../../../../../../services/attachment-keyx-service';
import { IBctwUser } from '../../../../../../services/bctw-service';
import { getLogger } from '../../../../../../utils/logger';

// TODO: It may make more sense to move this to the /telemetry endpoint.

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/process');

export const POST: Operation = [
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
  processAttachments()
];

POST.apiDoc = {
  description: 'Trigger the processing of keyx records for a survey.',
  tags: ['attachments'],
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
      description: 'Survey process attachments response.',
      content: {
        'application/json': {
          schema: {}
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

export function processAttachments(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Process attachments', message: 'params', req_params: req.params });

    const connection = getDBConnection(req['keycloak_token']);
    const user: IBctwUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };

    try {
      await connection.open();

      const attachmentKeyxService = new AttachmentKeyxService(connection);
      await attachmentKeyxService.processKeyxRecords(user);

      await connection.commit();

      return res.status(200).json({});
    } catch (error) {
      defaultLog.error({ label: 'processAttachments', message: 'error', error });
      await connection.rollback();
    } finally {
      connection.release();
    }
  };
}
