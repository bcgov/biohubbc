import { OpenAPIV3 } from 'openapi-types';

export const CreateCollectionSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'description', 'participants'],
  properties: {
    name: { type: 'string', description: 'The name of the collection to create' },
    description: { type: 'string', description: 'The description of the collection to create', nullable: true },
    participants: {
      type: 'array',
      description: 'List of users to add to the collection',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['system_user_id'],
        properties: {
          system_user_id: { type: 'number', description: 'Primary key of a system user to add to the collection' }
        }
      }
    }
  }
};

export const GetCollectionSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: ['collection_id', 'name', 'description', 'participants'],
  properties: {
    collection_id: { type: 'integer', description: 'Primary key of the collection' },
    name: { type: 'string', description: 'The name of the collection to create' },
    description: { type: 'string', description: 'The description of the collection to create', nullable: true },
    participants: {
      type: 'array',
      description: 'List of users to add to the collection',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['system_user_id'],
        properties: {
          system_user_id: { type: 'number', description: 'Primary key of a system user to add to the collection' }
        }
      }
    }
  }
};
