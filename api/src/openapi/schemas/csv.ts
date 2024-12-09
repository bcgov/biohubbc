import { OpenAPIV3 } from 'openapi-types';

/**
 * CSV validation error object schema
 *
 */
export const CSVErrorSchema: OpenAPIV3.SchemaObject = {
  title: 'CSV validation error object',
  type: 'object',
  additionalProperties: false,
  required: ['error', 'solution', 'row'],
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
      items: {
        oneOf: [{ type: 'string' }, { type: 'number' }]
      }
    },
    cell: {
      description: 'The CSV cell value',
      oneOf: [{ type: 'string' }, { type: 'number' }]
    },
    header: {
      description: 'The header name used in the CSV file',
      type: 'string'
    },
    row: {
      description: 'The row index the error occurred. Header row index 0. First data row index 1.',
      type: 'number'
    }
  }
};
