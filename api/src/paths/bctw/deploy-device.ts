import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../constants/roles';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { IBctwUser } from '../../services/bctw-service';
import { BctwService } from '../../services/bctw-service';

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
  deployDevice()
];

POST.apiDoc = {
  description: 'Create a new telemetry device deployment on an animal.',
  tags: ['bctw'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Deploy device post request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Deploy Device Request Object',
          type: 'object',
          required: ['device_id', 'frequency', 'manufacturer', 'model', 'critter_id'],
          properties: {
            device_id: {
              title: 'Device ID',
              type: 'string'
            },
            frequency: {
              title: 'Device Frequency',
              type: 'string'
            },
            manufacturer: {
              title: 'Device Manufacturer',
              type: 'string'
            },
            model: {
              title: 'Device Model',
              type: 'string'
            },
            critter_id: {
              title: 'Critter ID',
              type: 'string'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Device-Deployment post response object.',
      content: {
        'application/json': {
          schema: {
            title: 'Deploy Device Response Object',
            type: 'object',
            required: ['deployment_id', 'device_id', 'critter_id'],
            properties: {
              deployment_id: {
                title: 'Deployment ID',
                type: 'string'
              },
              device_id: {
                title: 'Device ID',
                type: 'string'
              },
              critter_id: {
                title: 'Critter ID',
                type: 'string'
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

export function deployDevice(): RequestHandler {
  return async (req, res) => {
    const user: IBctwUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    console.log('user', user);
    
    const bctw = new BctwService(user);
    const result = await bctw.deployDevice(req.body);
    return res.status(200).json(result);
  };
}
