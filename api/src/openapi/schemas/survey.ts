import { tags } from '../components/tags';

/**
 * Survey endpoint post body openapi schema.
 */
export const surveyPostBody = {
  title: 'Survey Post Object',
  type: 'object',
  // required: [],
  properties: {
    tags: {
      ...tags
    }
  }
};

/**
 * Survey endpoint response body openapi schema.
 */
export const surveyResponseBody = {
  title: 'Survey Response Object',
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'number'
    }
  }
};
