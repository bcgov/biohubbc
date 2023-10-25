import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { CritterbaseService, ICritterbaseUser } from '../../../services/critterbase-service';
import { getLogger } from '../../../utils/logger';
import { critterbaseCommonLookupResponse } from '../../../utils/shared-api-docs';

const defaultLog = getLogger('paths/critter-data/xref');

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
  getTaxonBodyLocations()
];

GET.apiDoc = {
  description: 'Gets allowed values for a particular taxons body locations in Critterbase.',
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
        type: 'string',
        format: 'uuid'
      }
    }
  ],
  responses: {
    200: {
      description: 'Taxon marking body location response object',
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

export function getTaxonBodyLocations(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const taxon_id = String(req.query.taxon_id);
    const cb = new CritterbaseService(user);

    try {
      const result = await cb.getTaxonBodyLocations(taxon_id);
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getTaxonBodyLocations', message: 'error', error });
      throw error;
    }
  };
}
