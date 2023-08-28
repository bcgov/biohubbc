import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../constants/roles';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { CritterbaseService, ICritterbaseUser } from '../../../services/critterbase-service';

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
  getFamilyById()
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
      name: 'familyId',
      schema: {
        type: 'string'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Family by ID response object',
      content: {
        'application/json': {
          schema: {
            title: 'Family object',
            type: 'object',
            properties: {
              parents: {
                type: 'array',
                items: {
                  title: 'Parent critter',
                  type: 'object'
                }
              },
              children: {
                type: 'array',
                items: {
                  title: 'Child critter',
                  type: 'object'
                }
              }
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

export function getFamilyById(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const key: string = req.params.familyId;
    const cb = new CritterbaseService(user);
    const result = await cb.getFamilyById(key);
    return res.status(200).json(result);
  };
}
