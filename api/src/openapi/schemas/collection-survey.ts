import { OpenAPIV3 } from 'openapi-types';

export const CreateCollectionSurveySchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: ['survey_id', 'collections'],
  properties: {
    survey_id: { type: 'integer', description: 'The primary key of the survey to share to collections' },
    collections: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['collection_id'],
        properties: {
          collection_id: { type: 'number', description: 'Primary key of a collection to share the survey to' }
        }
      }
    }
  }
};
