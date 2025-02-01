import { OpenAPIV3 } from 'openapi-types';

export const vantageReferenceRecordsSchema: OpenAPIV3.SchemaObject = {
  type: 'array',
  description: 'Vantage reference records.',
  items: {
    type: 'object',
    description: 'Vantage category reference record and its associated vantages.',
    required: ['vantage_category_id', 'name', 'description', 'vantages'],
    additionalProperties: false,
    properties: {
      vantage_category_id: {
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
      vantages: {
        type: 'array',
        description: 'Supported vantage for the vantage record.',
        items: {
          type: 'object',
          required: ['vantage_method_id', 'name', 'vantage_id', 'description'],
          additionalProperties: false,
          properties: {
            vantage_method_id: {
              type: 'integer',
              description: 'The primary key of the vantage method option.'
            },
            vantage_id: {
              type: 'integer',
              description: 'The vantage of the record'
            },
            name: {
              type: 'string',
              description: 'The name of the vantage method option.'
            },
            description: {
              type: 'string',
              description: 'The description of the vantage method option.'
            }
          }
        }
      }
    }
  }
};
