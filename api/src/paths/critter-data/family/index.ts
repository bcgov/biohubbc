import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { CritterbaseService, ICritterbaseUser } from '../../../services/critterbase-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/critter-data/family');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getFamilies()
];

GET.apiDoc = {
  description: 'Gets a list of all families available in critterbase.',
  tags: ['critterbase'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Family response',
      content: {
        'application/json': {
          schema: {
            title: 'Family response object',
            type: 'array',
            items: {
              title: 'Family',
              type: 'object'
            }
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

export function getFamilies(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };

    const cb = new CritterbaseService(user);
    try {
      const result = await cb.getFamilies();
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getFamilies', message: 'error', error });
      throw error;
    }
  };
}
