export const submissionTransformationSchema = {
  description: 'Occurrence Submission Transformation Schema',
  type: 'object',
  required: ['files'],
  properties: {
    name: {
      description: 'The name of the submission file',
      type: 'string'
    },
    description: {
      description: 'The description of the submission file',
      type: 'string'
    },
    transformations: {
      description: 'An array of transformations to apply against the submission file',
      type: 'array',
      items: {
        $ref: '#/$defs/submission_transformations'
      }
    }
  },
  $defs: {
    submission_transformations: {
      title: 'Submission file transformations',
      description: 'The transformations that can be applied against a submission file.',
      anyOf: [
        {
          $ref: '#/$defs/basic_transformer'
        },
        {
          $ref: '#/$defs/join_transformer'
        },
        {
          $ref: '#/$defs/split_transformer'
        }
      ]
    },
    basic_transformer: {
      description: '',
      type: 'object',
      properties: {
        basic_transformer: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            source: {
              type: 'object',
              properties: {
                file: {
                  type: 'string'
                },
                column: {
                  type: 'string'
                }
              }
            },
            target: {
              type: 'object',
              properties: {
                file: {
                  type: 'string'
                },
                column: {
                  type: 'string'
                }
              }
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    },
    join_transformer: {
      description: '',
      type: 'object',
      properties: {
        join_transformer: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            sources: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string'
                  },
                  column: {
                    type: 'string'
                  }
                }
              }
            },
            separator: {
              type: 'string'
            },
            target: {
              type: 'object',
              properties: {
                file: {
                  type: 'string'
                },
                column: {
                  type: 'string'
                }
              }
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    },
    split_transformer: {
      description: '',
      type: 'object',
      properties: {
        join_transformer: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            source: {
              type: 'object',
              properties: {
                file: {
                  type: 'string'
                },
                column: {
                  type: 'string'
                }
              }
            },
            separator: {
              type: 'string'
            },
            targets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string'
                  },
                  column: {
                    type: 'string'
                  }
                }
              }
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};
