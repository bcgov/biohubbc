export const validationConfigJSONSchema = {
  description: 'Occurrence Submission Validation Schema',
  type: 'object',
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
    defaultFile: {
      description: 'A fall-back file definition to use when no files/sheets match items in the files array',
      $ref: '#/$defs/file'
    },
    validations: {
      description: 'An array of validations to apply against the submission file',
      type: 'array',
      items: {
        $ref: '#/$defs/submission_validation'
      }
    },
    workbookValidations: {
      description:
        'An array of validations to apply across multiple worksheets within the given workbook submission file',
      type: 'array',
      items: {
        $ref: '#/$defs/workbook_validation'
      }
    }
  },
  $defs: {
    file: {
      description: 'A single file/sheet within a submission file',
      type: 'object',
      required: ['name', 'columns'],
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
      },
      additionalProperties: false
    },
    column: {
      description: 'A single column within a file/sheet',
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
      },
      additionalProperties: false
    },
    submission_validation: {
      title: 'Submission File Validation',
      description: 'The validators that can be applied against a submission file.',
      anyOf: [
        {
          $ref: '#/$defs/submission_required_files_validator'
        },
        {
          $ref: '#/$defs/mimetype_validator'
        }
      ]
    },
    workbook_validation: {
      title: 'Workbook Validation',
      description: 'The validators that can be applied against a workbook submission file.',
      anyOf: [
        {
          $ref: '#/$defs/workbook_parent_child_key_match_validator'
        }
      ]
    },
    file_validation: {
      title: 'File/Sheet Validation',
      description: 'The validators that can be applied against a file/sheet within a submission file.',
      anyOf: [
        {
          $ref: '#/$defs/file_required_columns_validator',
          description: 'column header validator'
        },
        {
          $ref: '#/$defs/file_recommended_columns_validator',
          description: 'column header validator'
        },
        {
          $ref: '#/$defs/file_duplicate_columns_validator',
          description: 'column header validator'
        },
        {
          $ref: '#/$defs/file_valid_columns_validator',
          description: 'column header validator '
        },
        {
          $ref: '#/$defs/file_column_unique_validator',
          description: 'column cell validator '
        }
      ]
    },
    column_validation: {
      title: 'Column Validation',
      description: 'The validators that can be applied against a column within a file/sheet.',
      anyOf: [
        {
          $ref: '#/$defs/column_required_validator'
        },
        {
          $ref: '#/$defs/column_format_validator'
        },
        {
          $ref: '#/$defs/column_code_validator'
        },
        {
          $ref: '#/$defs/column_range_validator'
        },
        {
          $ref: '#/$defs/column_numeric_validator'
        }
      ]
    },
    submission_required_files_validator: {
      description: 'Validates that this submission file contains required files/sheets',
      type: 'object',
      properties: {
        submission_required_files_validator: {
          type: 'object',
          required: ['required_files'],
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            required_files: {
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
    workbook_parent_child_key_match_validator: {
      description:
        'Validates that this workbook submission file does not contain keys belonging to a child sheet that are missing in its parent sheet',
      type: 'object',
      properties: {
        workbook_parent_child_key_match_validator: {
          type: 'object',
          required: ['child_worksheet_name', 'parent_worksheet_name', 'column_names'],
          properties: {
            description: {
              type: 'string'
            },
            child_worksheet_name: {
              type: 'string'
            },
            parent_worksheet_name: {
              type: 'string'
            },
            column_names: {
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
    mimetype_validator: {
      description: 'Validates that the mimetype of this submission/file is in an allowed set of values',
      type: 'object',
      properties: {
        mimetype_validator: {
          type: 'object',
          required: ['reg_exps'],
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            reg_exps: {
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
    file_required_columns_validator: {
      description: 'Column header validator that checks whether the file/sheet contains required columns',
      type: 'object',
      properties: {
        file_required_columns_validator: {
          type: 'object',
          required: ['required_columns'],
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            required_columns: {
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
    file_recommended_columns_validator: {
      description: 'Column header validator that checks whether the file/sheet contains recommended columns',
      type: 'object',
      properties: {
        file_recommended_columns_validator: {
          type: 'object',
          required: ['recommended_columns'],
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            recommended_columns: {
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
    file_duplicate_columns_validator: {
      description: 'Column header validator that checks whether this file/sheet contains recommended columns',
      type: 'object',
      properties: {
        file_duplicate_columns_validator: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    },
    file_valid_columns_validator: {
      description: 'Column header validator that checks whether this file/sheet contains only valid (known) columns',
      type: 'object',
      properties: {
        file_valid_columns_validator: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            valid_columns: {
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
    column_required_validator: {
      description: 'Column cell validator that checks that this column value is not empty.',
      type: 'object',
      properties: {
        column_required_validator: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    },
    column_format_validator: {
      description: 'Validates that this column value matches a regex',
      type: 'object',
      properties: {
        column_format_validator: {
          type: 'object',
          required: ['reg_exp', 'expected_format'],
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            reg_exp: {
              type: 'string'
            },
            reg_exp_flags: {
              type: 'string'
            },
            expected_format: {
              type: 'string'
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    },
    column_numeric_validator: {
      description: 'Validates that this column is a number',
      type: 'object',
      properties: {
        column_numeric_validator: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    },
    column_range_validator: {
      description: 'Validates that this column value matches a number range',
      type: 'object',
      properties: {
        column_range_validator: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            min_value: {
              type: 'number'
            },
            max_value: {
              type: 'number'
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    },
    column_code_validator: {
      description: 'Validates that this column value is in an allowed set of values',
      type: 'object',
      properties: {
        column_code_validator: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            allowed_code_values: {
              type: 'array',
              items: {
                $ref: '#/$defs/code_value'
              }
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    },
    file_column_unique_validator: {
      description: 'Column cell validator the checks that the column(s) are unique',
      type: 'object',
      properties: {
        file_column_unique_validator: {
          type: 'object',
          properties: {
            column_names: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            additionalProperties: false
          }
        }
      },
      additionalProperties: false
    },
    code_value: {
      description: 'Validates that this column value has a matching counterpart in the target `file` and `column`',
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: ['string', 'number']
        },
        description: {
          type: 'string'
        }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};
