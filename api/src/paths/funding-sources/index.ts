import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { FundingSource, FundingSourceSupplementaryData } from '../../repositories/funding-source-repository';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { FundingSourceService, IFundingSourceSearchParams } from '../../services/funding-source-service';
import { UserService } from '../../services/user-service';
import { getLogger } from '../../utils/logger';
import { getSystemUserFromRequest } from '../../utils/request';

const defaultLog = getLogger('paths/funding-sources/index');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      or: [
        {
          discriminator: 'SystemUser'
        },
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
              additionalProperties: false,
              required: ['funding_source_id', 'name', 'description', 'revision_count'],
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
                  description: 'The number of surveys that reference this funding source.',
                  nullable: true
                },
                survey_reference_amount_total: {
                  type: 'number',
                  minimum: 0,
                  description: 'The total amount from all references to this funding source by all surveys.',
                  nullable: true
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
    const connection = getDBConnection(req.keycloak_token);
    const filterFields: IFundingSourceSearchParams = req.query || {};
    try {
      await connection.open();

      const fundingSourceService = new FundingSourceService(connection);

      let response = await fundingSourceService.getFundingSources(filterFields);

      await connection.commit();

      const systemUser = getSystemUserFromRequest(req);

      if (!UserService.isAdmin(systemUser)) {
        // User is not an admin, strip sensitive fields from response
        response = removeNonAdminFieldsFromFundingSourcesResponse(response);
      }

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

/**
 * Removes sensitive (admin-only) fields from the funding sources response, returning a new sanitized array.
 *
 * @param {((FundingSource & FundingSourceSupplementaryData)[])} fundingSources
 * @return {*}  {((FundingSource & FundingSourceSupplementaryData)[])} array of funding sources with admin-only fields
 * removed.
 */
function removeNonAdminFieldsFromFundingSourcesResponse(
  fundingSources: (FundingSource & FundingSourceSupplementaryData)[]
): (FundingSource & FundingSourceSupplementaryData)[] {
  return fundingSources.map((item) => {
    delete item.survey_reference_count;
    delete item.survey_reference_amount_total;
    return item;
  });
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
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'description'],
          properties: {
            funding_source_id: {
              type: 'number',
              nullable: true
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
              minimum: 0,
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
            additionalProperties: false,
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
    const connection = getDBConnection(req.keycloak_token);
    const service = new FundingSourceService(connection);
    const data = req.body;
    try {
      await connection.open();

      const response = await service.postFundingSource(data);
      await connection.commit();

      return res.status(200).json({ funding_source_id: response.funding_source_id });
    } catch (error) {
      defaultLog.error({ label: 'createFundingSource', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
