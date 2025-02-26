import { OpenAPIV3 } from 'openapi-types';

export const EnvironmentStandardsSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description:
    'Environment standards response object showing supported environmental variables and associated information',
  additionalProperties: false,
  required: ['qualitative', 'quantitative'],
  properties: {
    qualitative: {
      type: 'array',
      description: 'Array of qualitative environmental variables',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'description', 'options'],
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
              additionalProperties: false,
              required: ['name', 'description'],
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
        additionalProperties: false,
        required: ['name', 'description', 'unit'],
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
    required: ['method_lookup_id', 'name', 'description', 'attributes'],
    properties: {
      method_lookup_id: {
        type: 'integer',
        minimum: 1
      },
      name: {
        type: 'string'
      },
      description: {
        type: 'string',
        nullable: true
      },
      attributes: {
        type: 'object',
        additionalProperties: false,
        required: ['qualitative', 'quantitative'],
        properties: {
          qualitative: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['name', 'description', 'options'],
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
              required: ['name', 'description'],
              properties: {
                name: {
                  type: 'string'
                },
                description: {
                  type: 'string',
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
};

export const MarkingStandardsSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description: 'Marking standards response object showing supported marking types and colours',
  additionalProperties: false,
  required: ['types', 'colours'],
  properties: {
    types: {
      type: 'array',
      description: 'Array of marking types',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'marking_type_id', 'description'],
        properties: {
          name: {
            type: 'string',
            description: 'Name of the marking type'
          },
          marking_type_id: {
            type: 'string',
            description: 'ID of the marking type'
          },
          description: {
            type: 'string',
            description: 'Description of the marking type',
            nullable: true
          }
        }
      }
    },
    colours: {
      type: 'array',
      description: 'Array of marking colour options',
      additionalProperties: false,
      required: ['colour', 'colour_id', 'description'],
      items: {
        type: 'object',
        properties: {
          colour: {
            type: 'string',
            description: 'Name of the marking colour'
          },
          colour_id: {
            type: 'string',
            description: 'ID of the marking colour'
          },
          description: {
            type: 'string',
            description: 'description of the marking colour',
            nullable: true
          }
        }
      }
    }
  }
};
