import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { FundingSourceService, IFundingSourceSearchParams } from '../../services/funding-source-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/funding-sources/index');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getFundingSources()
];

GET.apiDoc = {
  description: 'Get all funding sources.',
  tags: ['funding-source'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Funding sources response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              required: [
                'funding_source_id',
                'name',
                'description',
                'revision_count',
                'survey_reference_count',
                'survey_reference_amount_total'
              ],
              properties: {
                funding_source_id: {
                  type: 'integer',
                  minimum: 1
                },
                name: {
                  type: 'string'
                },
                description: {
                  type: 'string'
                },
                start_date: {
                  type: 'string',
                  nullable: true
                },
                end_date: {
                  type: 'string',
                  nullable: true
                },
                revision_count: {
                  type: 'integer',
                  minimum: 0
                },
                survey_reference_count: {
                  type: 'number',
                  minimum: 0,
                  description: 'The number of surveys that reference this funding source.'
                },
                survey_reference_amount_total: {
                  type: 'number',
                  minimum: 0,
                  description: 'The total amount from all references to this funding source by all surveys.'
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

/**
 * Get a list of funding sources.
 *
 * @returns {RequestHandler}
 */
export function getFundingSources(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);
    const filterFields: IFundingSourceSearchParams = req.query || {};
    try {
      await connection.open();

      const fundingSourceService = new FundingSourceService(connection);

      const response = await fundingSourceService.getFundingSources(filterFields);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getFundingSources', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  postFundingSource()
];

POST.apiDoc = {
  description: 'Create a funding source.',
  tags: ['funding-source'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Funding source post request object.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['name', 'description'],
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            start_date: {
              type: 'string',
              nullable: true
            },
            end_date: {
              type: 'string',
              nullable: true
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Funding source response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['funding_source_id'],
            properties: {
              funding_source_id: {
                type: 'number'
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

/**
 * Create a new funding source.
 *
 * @returns {RequestHandler}
 */
export function postFundingSource(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);
    const service = new FundingSourceService(connection);
    const data = req.body;
    try {
      await connection.open();

      const response = await service.postFundingSource(data);
      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'createFundingSource', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
