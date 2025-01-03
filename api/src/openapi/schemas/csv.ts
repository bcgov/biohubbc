import { OpenAPIV3 } from 'openapi-types';

/**
 * CSV validation error object schema
 *
 */
export const CSVErrorSchema: OpenAPIV3.SchemaObject = {
  title: 'CSV validation error object',
  type: 'object',
  additionalProperties: false,
  required: ['error', 'solution', 'values', 'cell', 'header', 'row'],
  properties: {
    error: {
      description: 'The error message',
      type: 'string'
    },
    solution: {
      description: 'The error solution or instructions to resolve',
      type: 'string'
    },
    values: {
      description: 'The list of allowed values if applicable',
      type: 'array',
      nullable: true,
      items: {
        oneOf: [
          {
            type: 'string'
          },
          {
            type: 'number'
          }
        ]
      }
    },
    cell: {
      description: 'The CSV cell value',
      oneOf: [
        {
          type: 'string'
        },
        {
          type: 'number'
        }
      ],
      nullable: true
    },
    header: {
      description: 'The header name used in the CSV file',
      type: 'string',
      nullable: true
    },
    row: {
      description: 'The row index the error occurred. Header row index 0. First data row index 1.',
      type: 'number'
    }
  }
};

/**
 * CSV validation error response schema
 *
 */
export const CSVValidationErrorResponse: OpenAPIV3.ResponseObject = {
  description: 'CSV validation errors response',
  content: {
    'application/json': {
      schema: {
        description: 'CSV validation error response object',
        required: ['name', 'status', 'message', 'errors'],
        properties: {
          name: {
            description: 'Error name',
            type: 'string'
          },
          status: {
            description: 'HTTP status code',
            type: 'number'
          },
          message: {
            description: 'Error message',
            type: 'string'
          },
          errors: {
            type: 'array',
            description: 'List of CSV errors which occurred during validation',
            items: CSVErrorSchema
          }
        }
      }
    }
  }
};
