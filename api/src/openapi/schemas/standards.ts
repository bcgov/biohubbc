import { OpenAPIV3 } from 'openapi-types';

export const EnvironmentStandardsSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description:
    'Environment standards response object showing supported environmental variables and associated information',
  additionalProperties: false,
  properties: {
    qualitative: {
      type: 'array',
      description: 'Array of qualitative environmental variables',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the environmental variable'
          },
          description: {
            type: 'string',
            description: 'Description of the environmental variable',
            nullable: true
          },
          options: {
            type: 'array',
            description: 'Array of options for the qualitative variable',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Description of the environmental variable option'
                },
                description: {
                  type: 'string',
                  description: 'Description of the environmental variable option',
                  nullable: true
                }
              }
            }
          }
        }
      }
    },
    quantitative: {
      type: 'array',
      description: 'Array of quantitative environmental variables',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the quantitative environmental variable'
          },
          description: {
            type: 'string',
            description: 'Description of the quantitative environmental variable',
            nullable: true
          },
          unit: {
            type: 'string',
            description: 'Unit of measurement of the quantitative environmental variable',
            nullable: true
          }
        }
      }
    }
  }
};

export const MethodStandardSchema: OpenAPIV3.SchemaObject = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      method_lookup_id: { type: 'number' },
      name: { type: 'string' },
      description: { type: 'string', nullable: true },
      attributes: {
        type: 'object',
        additionalProperties: false,
        properties: {
          qualitative: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
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
                    properties: {
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
          quantitative: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: {
                  type: 'string'
                },
                description: {
                  type: 'string',
                  nullable: true
                },
                unit: { type: 'string', nullable: true }
              }
            }
          }
        }
      }
    }
  }
};
