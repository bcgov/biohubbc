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
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
    },
    transform: {
      type: 'array',
      items: {
        type: 'object',
        required: ['transformations'],
        properties: {
          condition: {
            type: 'object',
            properties: {
              if: {
                type: 'object',
                properties: {
                  columns: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  }
                },
                additionalProperties: false
              }
            },
            additionalProperties: false
          },
          transformations: {
            type: 'array',
            items: {
              type: 'object',
              required: ['fields'],
              properties: {
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
                            },
                            unique: {
                              type: 'string'
                            }
                          },
                          additionalProperties: false
                        },
                        {
                          type: 'object',
                          required: ['value'],
                          properties: {
                            value: {
                              type: ['string', 'number']
                            }
                          },
                          additionalProperties: false
                        }
                      ]
                    }
                  },
                  additionalProperties: false
                }
              },
              additionalProperties: false
            }
          },
          postTransformations: {
            type: 'array',
            items: {
              anyOf: [
                {
                  type: 'object',
                  properties: {
                    relationship: {
                      type: 'object',
                      properties: {
                        spreadColumn: {
                          type: 'string'
                        },
                        uniqueIdColumn: {
                          type: 'string'
                        }
                      },
                      additionalProperties: false
                    }
                  },
                  additionalProperties: false
                }
              ]
            }
          }
        },
        additionalProperties: false
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
              type: 'object',
              properties: {
                source: {
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
                        },
                        unique: {
                          type: 'string'
                        }
                      },
                      additionalProperties: false
                    },
                    {
                      type: 'object',
                      required: ['value'],
                      properties: {
                        value: {
                          type: ['string', 'number']
                        }
                      },
                      additionalProperties: false
                    }
                  ]
                },
                target: {
                  type: 'string'
                }
              },
              additionalProperties: false
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
