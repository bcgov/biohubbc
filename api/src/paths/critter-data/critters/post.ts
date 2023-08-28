import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../constants/roles';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { CritterbaseService, ICritterbaseUser } from '../../../services/critterbase-service';

// TODO: Put this all into an existing endpoint

export const POST: Operation = [
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
  createCritter()
];

POST.apiDoc = {
  description:
    'Creates a new critter in critterbase. Optionally make captures, markings, measurements, etc. along with it.',
  tags: ['critterbase'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Critterbase bulk creation request object',
    content: {
      'application/json': {
        schema: {
          title: 'Bulk post request object',
          type: 'object',
          required: ['name', 'data'],
          properties: {
            critters: {
              title: 'critters',
              type: 'array',
              items: {
                title: 'critter',
                type: 'object'
              }
            },
            captures: {
              title: 'captures',
              type: 'array',
              items: {
                title: 'capture',
                type: 'object'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Responds with counts of objects created in critterbase.',
      content: {
        'application/json': {
          schema: {
            title: 'Bulk creation response object',
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

export function createCritter(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };

    const cb = new CritterbaseService(user);
    const result = await cb.createCritter(req.body);
    return res.status(200).json(result);
  };
}
