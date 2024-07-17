import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../database/db';
import { TechniqueAttributeService } from '../../../services/technique-attributes-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/reference');

export const GET: Operation = [getTechniqueAttributes()];

GET.apiDoc = {
  description: 'Find technique attributes',
  tags: ['reference'],
  parameters: [
    {
      in: 'query',
      name: 'methodLookupId',
      schema: {
        type: 'array',
        items: {
          type: 'string'
        },
        minItems: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Attribute techniques for a method lookup id.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                method_lookup_id: {
                  type: 'integer',
                  minimum: 1
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
                },
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
 * Get all technique attributes for multiple method lookup ids.
 *
 * @returns {RequestHandler}
 */
export function getTechniqueAttributes(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const methodLookupIds: number[] = (req.query.methodLookupId as string[]).map(Number);

      await connection.open();

      const techniqueAttributeService = new TechniqueAttributeService(connection);

      const response = await techniqueAttributeService.getAttributeDefinitionsByMethodLookupIds(methodLookupIds);

      // Allow browsers to cache this response for 300 seconds (5 minutes)
      res.setHeader('Cache-Control', 'private, max-age=300');

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getTechniqueAttributes', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
