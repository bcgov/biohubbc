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
  getQualMeasurementOptions()
];

GET.apiDoc = {
  description: 'Gets allowed values for a qualitative measurement, dependent on taxon.',
  tags: ['critterbase'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'taxon_measurement_id',
      schema: {
        type: 'string',
        format: 'uuid'
      }
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
      description: 'Allowed values for qualitative measurement',
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

export function getQualMeasurementOptions(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const taxon_id = String(req.query.taxon_measurement_id);
    const cb = new CritterbaseService(user);
    try {
      const result = await cb.getQualitativeOptions(taxon_id);
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getQualMeasurementOptions', message: 'error', error });
      throw error;
    }
  };
}
