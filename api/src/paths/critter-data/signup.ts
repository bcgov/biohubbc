import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { CritterbaseService, ICritterbaseUser } from '../../services/critterbase-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/critter-data/signup');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  signUp()
];

POST.apiDoc = {
  description: 'Creates a new user in critterbase based on this SIMS user"s keycloak details.',
  tags: ['critterbase'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Responds with the users UUID in critterbase.',
      content: {
        'application/json': {
          schema: {
            title: 'User response object.',
            type: 'object'
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

export function signUp(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const cb = new CritterbaseService(user);
    try {
      const result = await cb.signUp();
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'signUp', message: 'error', error });
      throw error;
    }
  };
}
