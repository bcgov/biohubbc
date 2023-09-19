import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../constants/roles';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { CritterbaseService, ICritterbaseUser } from '../../../services/critterbase-service';
import { getLogger } from '../../../utils/logger';
import { critterbaseCommonLookupResponse } from '../../../utils/shared-api-docs';

const defaultLog = getLogger('paths/critter-data/xref/collection-units');

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
  getCollectionUnitsByCategory()
];

GET.apiDoc = {
  description: 'Gets allowed values within a collection unit category.',
  tags: ['critterbase'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'category_id',
      schema: {
        type: 'string',
        format: 'uuid'
      }
    }
  ],
  responses: {
    200: {
      description: 'Taxon collection unit response object',
      content: {
        'application/json': {
          schema: critterbaseCommonLookupResponse
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

export function getCollectionUnitsByCategory(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const category_id = String(req.query.category_id);
    const cb = new CritterbaseService(user);

    try {
      const result = await cb.getCollectionUnits(category_id);
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getCollectionUnitsByCategory', message: 'error', error });
      throw error;
    }
  };
}
