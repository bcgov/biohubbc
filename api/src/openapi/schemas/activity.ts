import { tags } from '../components/tags';

const activity = {
  title: 'Activity Object',
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

export const activityPostBody = {
  ...activity
};

export const activityResponseBody = {
  ...activity,
  properties: {
    id: {
      description: 'Activity ID',
      type: 'number'
    },
    ...activity.properties
  }
};
