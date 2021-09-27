export const submissionTransformationSchema = {
  description: 'Occurrence Submission Transformation Schema',
  type: 'object',
  required: ['flatten', 'transform', 'parse'],
  properties: {
    name: {
      description: 'The name of the submission file',
      type: 'string'
    },
    description: {
      description: 'The description of the submission file',
      type: 'string'
    },
    flatten: {
      type: 'array',
      items: {
        type: 'object',
        required: ['fileName', 'uniqueId'],
        properties: {
          fileName: {
            type: 'string'
          },
          uniqueId: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          parent: {
            type: 'object',
            properties: {
              fileName: {
                type: 'string'
              },
              uniqueId: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }
        },
        additionalProperties: false
      }
    },
    transform: {
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'object',
          required: ['fileName', 'fields'],
          properties: {
            fileName: {
              type: 'string'
            },
            fields: {
              type: 'object',
              patternProperties: {
                '^.*$': {
                  type: 'object',
                  oneOf: [
                    {
                      type: 'object',
                      required: ['columns'],
                      properties: {
                        columns: {
                          type: 'array',
                          items: {
                            type: 'string'
                          }
                        },
                        separator: {
                          type: 'string'
                        }
                      }
                    },
                    {
                      type: 'object',
                      required: ['value'],
                      properties: {
                        value: {
                          type: 'string'
                        }
                      }
                    }
                  ]
                }
              }
            },
            conditionalFields: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          },
          additionalProperties: false
        }
      }
    },
    parse: {
      type: 'array',
      items: {
        type: 'object',
        required: ['fileName', 'columns'],
        properties: {
          fileName: {
            type: 'string'
          },
          columns: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          conditionalFields: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        },
        additionalProperties: false
      }
    }
  },
  additionalProperties: false
};
