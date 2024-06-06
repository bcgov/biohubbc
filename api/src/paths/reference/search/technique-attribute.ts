import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../database/db';
import { TechniqueService } from '../../../services/technique-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/reference');

export const GET: Operation = [findTechniqueAttributes()];

GET.apiDoc = {
  description: 'Find technique attributes',
  tags: ['reference'],
  parameters: [
    {
      in: 'query',
      name: 'methodLookupIds',
      schema: {
        type: 'string'
      },
      style: 'form',
      explode: false,
      required: true,
      description: 'Comma-separated list of method lookup IDs to retrieve attributes for'
    }
  ],
  responses: {
    200: {
      description: 'Attribute techniques for a method lookup id',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                qualitative_attributes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['method_lookup_attribute_qualitative_id', 'name', 'description', 'options'],
                    properties: {
                      method_lookup_attribute_qualitative_id: {
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
                          required: ['method_lookup_attribute_qualitative_option_id', 'name', 'description'],
                          properties: {
                            method_lookup_attribute_qualitative_option_id: {
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
                quantitative_attributes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['method_lookup_attribute_quantitative_id', 'name', 'description', 'min', 'max', 'unit'],
                    properties: {
                      method_lookup_attribute_quantitative_id: {
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
 * Find all techniques attributes for multiple method lookup ids
 *
 * @returns {RequestHandler}
 */
export function findTechniqueAttributes(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      let methodLookupIds: number[] = [];

      if (typeof req.query.methodLookupIds === 'string') {
        methodLookupIds = req.query.methodLookupIds.split(',').map((id) => Number(id));
      }

      await connection.open();

      const techniqueService = new TechniqueService(connection);

      const response = await techniqueService.getAttributesForMethodLookupIds(methodLookupIds);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'findTechniqueAttributes', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
