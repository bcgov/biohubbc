import { tags } from '../components/tags';

/**
 * Activity endpoint post body openapi schema.
 */
export const activityPostBody = {
  title: 'Activity Post Object',
  type: 'object',
  // required: [],
  properties: {
    tags: { ...tags },
    template_id: {
      description: 'ID of the template used to render a form for this activity.',
      type: 'number'
    },
    form_data: {
      description: 'Form data for this activity.',
      type: 'object'
    }
  }
};

/**
 * Activity endpoint response body openapi schema.
 */
export const activityResponseBody = {
  title: 'Activity Response Object',
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'number'
    }
  }
};
