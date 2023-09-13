import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../constants/roles';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { CritterbaseService, ICritterbaseUser } from '../../../services/critterbase-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/critter-data/critters/filter');
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
  filterCritters()
];

POST.apiDoc = {
  description: 'Retrieves critters by filtering the global list with the criteria specified in the request body.',
  tags: ['critterbase'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Filtering request object',
    content: {
      'application/json': {
        schema: {
          title: 'Bulk post request object',
          type: 'object',
          properties: {
            critters: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid'
              }
            },
            animal_ids: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            wlh_ids: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            collection_units: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            taxon_name_commons: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Responds with an array of critters.',
      content: {
        'application/json': {
          schema: {
            title: 'List of filtered critters',
            type: 'array',
            items: {
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

export function filterCritters(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };

    const cb = new CritterbaseService(user);
    try {
      const result = await cb.filterCritters(req.body);
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'filterCritters', message: 'error', error });
      throw error;
    }
  };
}
