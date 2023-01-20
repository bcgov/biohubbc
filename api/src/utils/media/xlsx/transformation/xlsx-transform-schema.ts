/**
 * A JSON-Schema definition for a `TransformSchema`.
 */
export const transformationConfigJSONSchema = {
  title: 'Transformation Schema',
  type: 'object',
  required: ['templateMeta', 'map', 'dwcMeta'],
  properties: {
    templateMeta: {
      type: 'array',
      description:
        'Defines the hierarchical structure of the template, which columns represent keys, and the parent-child relationship of the sheets. Used to de-normalize the template data.',
      items: {
        $ref: '#/$defs/TemplateMetaSchema'
      }
    },
    map: {
      type: 'array',
      description:
        'Defines the mapping operations that are executed against each flattened row of the template. Used to transform the template data into its corresponding DWC representation.',
      items: {
        $ref: '#/$defs/MapSchema'
      }
    },
    dwcMeta: {
      type: 'array',
      description: 'Defines the unique keys for each DWC sheet. Used to normalize the DWC data.',
      items: {
        $ref: '#/$defs/DwcMeta'
      }
    }
  },
  $defs: {
    TemplateMetaSchema: {
      title: 'Sheet Schema',
      type: 'object',
      required: ['sheetName', 'primaryKey', 'parentKey', 'type', 'foreignKeys'],
      properties: {
        sheetName: {
          type: 'string',
          description: 'The name of the template sheet'
        },
        primaryKey: {
          type: 'array',
          description:
            'An array of template column names which combined represent a unique key for rows in this sheet.',
          items: {
            type: 'string'
          }
        },
        parentKey: {
          type: 'array',
          description:
            'An array of template column names which combined represent a unique key for the parent row of rows in this sheet.',
          items: {
            type: 'string'
          }
        },
        type: {
          type: 'string',
          enum: ['root', 'leaf', '']
        },
        foreignKeys: {
          type: 'array',
          items: {
            type: 'object',
            description: 'An array of child template sheet objects.',
            properties: {
              sheetName: {
                type: 'string',
                description: 'The name of a child template sheet'
              },
              primaryKey: {
                type: 'array',
                description:
                  'An array of template column names which combined represent a unique key for child rows of this sheet.',
                items: {
                  type: 'string',
                  description: 'A template column name.'
                }
              }
            },
            additionalProperties: false
          }
        }
      },
      additionalProperties: false
    },
    MapSchema: {
      title: 'Map Schema',
      type: 'object',
      required: ['sheetName', 'fields'],
      properties: {
        sheetName: {
          type: 'string',
          description: 'The name of the DWC sheet'
        },
        condition: {
          type: 'object',
          description:
            'Defines a condition, which contains one or more checks that must be met in order to proceed processing this `MapSchema` item.',
          properties: {
            type: {
              type: 'string',
              enum: ['and', 'or']
            },
            checks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ifNotEmpty: {
                    type: 'string'
                  }
                },
                additionalProperties: false
              }
            }
          },
          additionalProperties: false
        },
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              columnName: {
                type: 'string'
              },
              columnValue: {
                type: 'array',
                items: {
                  $ref: '#/$defs/MapColumnValueSchema'
                }
              }
            },
            additionalProperties: false
          }
        },
        add: {
          type: 'array',
          items: {
            $ref: '#/$defs/MapSchema'
          }
        }
      },
      additionalProperties: false
    },
    MapColumnValueSchema: {
      title: 'MapColumnValueSchema',
      type: 'object',
      oneOf: [{ required: ['paths'] }, { required: ['static'] }],
      properties: {
        paths: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        static: {
          type: 'string'
        },
        join: {
          type: 'string',
          description: 'A string used when concatenating columns to create keys.',
          default: ':'
        },
        postfix: {
          type: 'object',
          properties: {
            paths: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            static: {
              type: 'string'
            }
          },
          additionalProperties: false
        },
        condition: {
          type: 'object',
          description:
            'Defines a condition, which contains one or more checks that must be met in order to proceed processing this `MapColumnValueSchema` item.',
          properties: {
            type: {
              type: 'string',
              enum: ['and', 'or']
            },
            checks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ifNotEmpty: {
                    type: 'string'
                  }
                }
              }
            }
          },
          additionalProperties: false
        },
        add: {
          type: 'array',
          description:
            'An array of additional schemas to add to the process queue. Used to create additional records from within the context of the current schema being processed.',
          items: {
            $ref: '#/$defs/MapSchema'
          }
        }
      },
      additionalProperties: false
    },
    DwcMeta: {
      title: 'Dwc Schema',
      type: 'object',
      properties: {
        sheetName: {
          type: 'string',
          description: 'The name of the DWC sheet'
        },
        primaryKey: {
          type: 'array',
          description: 'An array of DWC column names which combined represent a unique key for rows in this sheet.',
          items: {
            type: 'string',
            description: 'A DWC column name.'
          }
        }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};
