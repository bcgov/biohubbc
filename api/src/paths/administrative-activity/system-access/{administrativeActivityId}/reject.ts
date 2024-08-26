import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ADMINISTRATIVE_ACTIVITY_STATUS_TYPE } from '../../../../constants/administrative-activity';
import { SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { AdministrativeActivityService } from '../../../../services/administrative-activity-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/administrative-activity/system-access/{administrativeActivityId}/reject');

export const PUT: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  rejectAccessRequest()
];

PUT.apiDoc = {
  description: 'Update a users system access request and add any specified system roles to the user.',
  tags: ['user'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'administrativeActivityId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Add system user roles to user OK.'
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

export function rejectAccessRequest(): RequestHandler {
  return async (req, res) => {
    const administrativeActivityId = Number(req.params.administrativeActivityId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const administrativeActivityService = new AdministrativeActivityService(connection);

      await administrativeActivityService.putAdministrativeActivity(
        administrativeActivityId,
        ADMINISTRATIVE_ACTIVITY_STATUS_TYPE.REJECTED
      );

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'updateAccessRequest', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
