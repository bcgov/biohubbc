import { OpenAPIV3 } from 'openapi-types';

export const warningSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description: 'General warning object to inform the user of potential data issues.',
  required: ['name', 'message', 'data'],
  additionalProperties: false,
  properties: {
    name: {
      type: 'string'
    },
    message: {
      type: 'string'
    },
    data: {
      type: 'object',
      properties: {
        // Allow any properties
      }
    },
    errors: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'string'
          },
          {
            type: 'object'
          }
        ]
      }
    }
  }
};

export type WarningSchema = {
  name: string;
  message: string;
  data?: Record<string, unknown>;
  errors?: (string | Record<string, unknown>)[];
};
