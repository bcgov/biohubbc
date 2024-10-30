import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { FundingSourceService } from '../../services/funding-source-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/funding-source/{fundingSourceId}');

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
  getFundingSource()
];

GET.apiDoc = {
  description: 'Get a single funding source.',
  tags: ['funding-source'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'fundingSourceId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Funding source response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['funding_source', 'funding_source_survey_references'],
            properties: {
              funding_source: {
                type: 'object',
                additionalProperties: false,
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
              },
              funding_source_survey_references: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: [
                    'survey_funding_source_id',
                    'survey_id',
                    'funding_source_id',
                    'amount',
                    'revision_count',
                    'project_id',
                    'survey_name'
                  ],
                  properties: {
                    survey_funding_source_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    survey_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    funding_source_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    amount: {
                      type: 'number',
                      minimum: 0
                    },
                    revision_count: {
                      type: 'integer',
                      minimum: 0
                    },
                    project_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    survey_name: {
                      type: 'string'
                    }
                  }
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
 * Get a single funding source.
 *
 * @returns {RequestHandler}
 */
export function getFundingSource(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    const fundingSourceId = Number(req.params.fundingSourceId);

    try {
      await connection.open();

      const fundingSourceService = new FundingSourceService(connection);

      const response = await fundingSourceService.getFundingSource(fundingSourceId);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getFundingSource', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const PUT: Operation = [
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
  putFundingSource()
];

PUT.apiDoc = {
  description: 'Update a single funding source.',
  tags: ['funding-source'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'fundingSourceId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Funding source put request object.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'description', 'revision_count'],
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
                type: 'integer',
                minimum: 1
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
 * Update a single funding source.
 *
 * @returns {RequestHandler}
 */
export function putFundingSource(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const fundingSourceService = new FundingSourceService(connection);

      const response = await fundingSourceService.putFundingSource(req.body);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'putFundingSource', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const DELETE: Operation = [
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
  deleteFundingSource()
];

DELETE.apiDoc = {
  description: 'Delete a single funding source.',
  tags: ['funding-source'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'fundingSourceId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
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
                type: 'integer',
                minimum: 1
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
 * Delete a single funding source.
 *
 * @returns {RequestHandler}
 */
export function deleteFundingSource(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    const fundingSourceId = Number(req.params.fundingSourceId);

    try {
      await connection.open();

      const fundingSourceService = new FundingSourceService(connection);

      const response = await fundingSourceService.deleteFundingSource(fundingSourceId);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'deleteFundingSource', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
