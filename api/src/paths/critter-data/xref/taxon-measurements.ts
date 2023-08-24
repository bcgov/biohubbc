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
  getTaxonMeasurements()
];

GET.apiDoc = {
  description: 'Gets allowed values a particular taxons measurement types in Critterbase.',
  tags: ['critterbase'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'taxon_id',
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
            title: 'Taxon measurements',
            type: 'array',
            items: {
              title: 'Measurement type',
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

export function getTaxonMeasurements(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const taxon_id = String(req.query.taxon_id);
    console.log('Key was: ' + taxon_id);
    const cb = new CritterbaseService(user);
    const result = await cb.getTaxonMeasurements(taxon_id);
    return res.status(200).json(result);
  };
}
