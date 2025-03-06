import { OpenAPIV3 } from 'openapi-types';

/**
 * Schema for markdown records used in versioned help dialogs
 *
 */
export const markdownSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description: 'Schema for get markdown response',
  additionalProperties: false,
  required: ['markdown'],
  properties: {
    markdown: {
      type: 'object',
      description: 'Markdown record',
      required: ['markdown_id', 'markdown_type_id', 'data', 'participated'],
      additionalProperties: false,
      properties: {
        markdown_id: {
          type: 'number',
          description: 'Primary key of the markdown record',
          minimum: 1
        },
        markdown_type_id: {
          type: 'number',
          description: 'Type of the markdown record, used to identify which records correspond to which dialogs',
          minimum: 1
        },
        data: {
          type: 'string',
          description: 'Markdown string to display'
        },
        participated: {
          type: 'boolean',
          description: 'True if the user has already scored the markdown record, otherwise false.'
        }
      }
    }
  }
};
