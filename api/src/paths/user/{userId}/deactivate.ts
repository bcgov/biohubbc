import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/http-error';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { ProjectParticipationService } from '../../../services/project-participation-service';
import { UserService } from '../../../services/user-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/deactivate');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  deactivateSystemUser()
];

POST.apiDoc = {
  description: 'Deactivate and block a system user from the system',
  tags: ['user'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'userId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Deactivated system user from system OK.'
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

export function deactivateSystemUser(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'deactivateSystemUser', message: 'params', req_params: req.params });

    const systemUserId = req.params && Number(req.params.userId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();
      const projectParticipationService = new ProjectParticipationService(connection);

      const isUserTheOnlyCoordinator =
        await projectParticipationService.isUserTheOnlyProjectCoordinatorOnAnyProject(systemUserId);

      if (isUserTheOnlyCoordinator) {
        throw new HTTP400(
          `Cannot deactivate user. User is the only ${SURVEY_ROLE.COORDINATOR} for one or more projects.`
        );
      }

      const userService = new UserService(connection);

      const usrObject = await userService.getUserById(systemUserId);

      if (usrObject.record_end_date) {
        throw new HTTP400('The system user is already deactivated.');
      }

      await userService.deactivateSystemUser(systemUserId);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deactivateSystemUser', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
