export const submissionValidationSchema = {
  description: 'Occurrence Submission Validation Schema',
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
    files: {
      description: 'An array of files/sheets within the submission file',
      type: 'array',
      items: [
        {
          $ref: '#/$defs/file'
        }
      ]
    },
    validations: {
      description: 'An array of validations to apply against the submission file',
      type: 'array',
      items: {
        $ref: '#/$defs/submission_validation'
      }
    }
  },
  $defs: {
    file: {
      description: 'A single file/sheet within a submission file',
      type: 'object',
      required: ['columns'],
      properties: {
        name: {
          description: 'The name of the file/sheet',
          type: 'string'
        },
        description: {
          description: 'The description of the file/sheet',
          type: 'string'
        },
        columns: {
          description: 'An array of columns within the file',
          type: 'array',
          items: {
            $ref: '#/$defs/column'
          }
        },
        validations: {
          description: 'An array of validations to apply against the file/sheet',
          type: 'array',
          items: {
            $ref: '#/$defs/file_validation'
          }
        }
      }
    },
    column: {
      description: 'An single column within a file/sheet',
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          description: 'The name of the column',
          type: 'string'
        },
        description: {
          description: 'The description of the column',
          type: 'string'
        },
        validations: {
          description: 'An array of validations to apply against the column',
          type: 'array',
          items: {
            $ref: '#/$defs/column_validation'
          }
        }
      }
    },
    submission_validation: {
      anyOf: [
        {
          $ref: '#/$defs/submission_required_files_validator'
        },
        {
          $ref: '#/$defs/mimetype_validator'
        }
      ]
    },
    file_validation: {
      anyOf: [
        {
          $ref: '#/$defs/file_required_columns_validator'
        },
        {
          $ref: '#/$defs/file_recommended_columns_validator'
        },
        {
          $ref: '#/$defs/mimetype_validator'
        }
      ]
    },
    column_validation: {
      anyOf: [
        {
          $ref: '#/$defs/column_type_validator'
        },
        {
          $ref: '#/$defs/column_format_validator'
        },
        {
          $ref: '#/$defs/column_code_validator'
        },
        {
          $ref: '#/$defs/column_unique_validator'
        },
        {
          $ref: '#/$defs/column_key_validator'
        }
      ]
    },
    submission_required_files_validator: {
      description: 'Validates that this submission file contains required files/sheets',
      type: 'object',
      properties: {
        required_files: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      },
      additionalProperties: 'false'
    },
    mimetype_validator: {
      description: 'Validates that the mimetype of this submission/file is in an allowed set of values',
      type: 'object',
      properties: {
        allowed_mimetypes: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      },
      additionalProperties: 'false'
    },
    file_required_columns_validator: {
      description: 'Validates that this file/sheet contains required columns',
      type: 'object',
      properties: {
        required_columns: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      },
      additionalProperties: 'false'
    },
    file_recommended_columns_validator: {
      description: 'Validates that this file/sheet contains recommended columns',
      type: 'object',
      properties: {
        recommended_columns: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      },
      additionalProperties: 'false'
    },
    column_type_validator: {
      description: 'Validates that this column value is of a certain type',
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          enum: ['string', 'number', 'date']
        }
      },
      additionalProperties: 'false'
    },
    column_format_validator: {
      description: 'Validates that this column value matches a pattern',
      type: 'object',
      properties: {
        pattern: {
          type: 'string'
        }
      },
      additionalProperties: 'false'
    },
    column_code_validator: {
      description: 'Validates that this column value is in an allowed set of values',
      type: 'object',
      properties: {
        allowed_codes: {
          type: 'string'
        }
      },
      additionalProperties: 'false'
    },
    column_unique_validator: {
      description: 'Validates that this column value is unique within this column',
      type: 'object',
      properties: {
        is_unique: {
          type: 'boolean'
        }
      },
      additionalProperties: 'false'
    },
    column_key_validator: {
      description: 'Validates that this column value has a matching counterpart in the target `file` and `column`',
      type: 'object',
      properties: {
        parent_key: {
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
      additionalProperties: 'false'
    }
  }
};
