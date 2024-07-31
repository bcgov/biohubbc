import { OpenAPIV3 } from 'openapi-types';

export const EnvironmentStandardsSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  properties: {
    qualitative: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          description: {
            type: 'string'
          },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                },
                description: {
                  type: 'string'
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
        properties: {
          name: {
            type: 'string'
          },
          description: {
            type: 'string'
          }
        }
      }
    }
  }
};

export const MethodStandardsSchema: OpenAPIV3.SchemaObject = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      method_lookup_id: { type: 'number' },
      name: { type: 'string' },
      description: { type: 'string' },
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
                  type: 'string'
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
                        type: 'string'
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
                  type: 'string'
                },
                unit: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
};
