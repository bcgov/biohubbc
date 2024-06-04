import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../database/db';
import { CodeService } from '../../../services/code-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/reference');

export const GET: Operation = [findSubcountEnvironments()];

GET.apiDoc = {
  description: 'Find subcount environment data.',
  tags: ['reference'],
  parameters: [
    {
      in: 'query',
      name: 'searchTerm',
      schema: {
        type: 'string'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Subcount environment data response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              qualitative_environments: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['environment_qualitative_id', 'name', 'description', 'options'],
                  properties: {
                    environment_qualitative_id: {
                      type: 'string',
                      format: 'uuid'
                    },
                    name: {
                      type: 'string'
                    },
                    description: {
                      type: 'string',
                      nullable: true
                    },
                    options: {
                      type: 'array',
                      items: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['environment_qualitative_option_id', 'name', 'description'],
                        properties: {
                          environment_qualitative_option_id: {
                            type: 'string',
                            format: 'uuid'
                          },
                          environment_qualitative_id: {
                            type: 'string',
                            format: 'uuid'
                          },
                          name: {
                            type: 'string'
                          },
                          description: {
                            type: 'string',
                            nullable: true
                          }
                        }
                      }
                    }
                  }
                }
              },
              quantitative_environments: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['environment_quantitative_id', 'name', 'description', 'min', 'max', 'unit'],
                  properties: {
                    environment_quantitative_id: {
                      type: 'string',
                      format: 'uuid'
                    },
                    name: {
                      type: 'string'
                    },
                    description: {
                      type: 'string',
                      nullable: true
                    },
                    min: {
                      type: 'integer',
                      nullable: true
                    },
                    max: {
                      type: 'integer',
                      nullable: true
                    },
                    unit: {
                      type: 'string',
                      nullable: true
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
 * Find all subcount environments based on the given search term.
 *
 * @returns {RequestHandler}
 */
export function findSubcountEnvironments(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const searchTerm = String(req.query.searchTerm);

      await connection.open();

      const codeService = new CodeService(connection);

      const response = await codeService.findSubcountEnvironments([searchTerm]);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'findSubcountEnvironments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
