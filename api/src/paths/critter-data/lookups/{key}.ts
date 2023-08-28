import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../constants/roles';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { CritterbaseService, ICbRouteKey, ICritterbaseUser } from '../../../services/critterbase-service';

// TODO: Put this all into an existing endpoint

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
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
  getLookupValues()
];

GET.apiDoc = {
  description: 'Gets allowed values for colours in Critterbase.',
  tags: ['critterbase'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'key',
      schema: {
        type: 'string'
      },
      required: true
    },
    {
      in: 'query',
      name: 'format',
      schema: {
        type: 'string'
      }
    }
  ],
  responses: {
    200: {
      description: 'Lookup response object',
      content: {
        'application/json': {
          schema: {
            anyOf: [
              {
                title: 'asSelect',
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    key: {
                      type: 'string'
                    },
                    id: {
                      type: 'string'
                    },
                    value: {
                      type: 'string'
                    }
                  }
                }
              },
              {
                title: 'Enum response',
                type: 'array',
                items: {
                  title: 'Enum value',
                  type: 'string'
                }
              }
            ]
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

export function getLookupValues(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const key: ICbRouteKey = req.params.key as ICbRouteKey;
    const cb = new CritterbaseService(user);
    const params = [];
    for (const [a, b] of Object.entries(req.query)) {
      params.push({ key: String(a), value: String(b) });
    }
    const result = await cb.getLookupValues(key, params);
    return res.status(200).json(result);
  };
}
