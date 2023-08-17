import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/http-error';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { ProjectParticipationService } from '../../../services/project-participation-service';
import { UserService } from '../../../services/user-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/delete');

export const DELETE: Operation = [
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
  removeSystemUser()
];

DELETE.apiDoc = {
  description: 'Remove a user from the system.',
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
      description: 'Remove system user from system OK.'
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/401'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function removeSystemUser(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'removeSystemUser', message: 'params', req_params: req.params });

    const userId = req.params && Number(req.params.userId);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();
      const projectParticipationService = new ProjectParticipationService(connection);

      await projectParticipationService.checkIfUserIsOnlyProjectLeadOnAnyProject(userId, connection);

      const userService = new UserService(connection);

      const usrObject = await userService.getUserById(userId);

      if (usrObject.record_end_date) {
        throw new HTTP400('The system user is not active');
      }

      await userService.deleteAllProjectRoles(userId);

      await userService.deleteUserSystemRoles(userId);

      await userService.deactivateSystemUser(userId);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'removeSystemUser', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
