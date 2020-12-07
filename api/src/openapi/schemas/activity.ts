const activity = {
  title: 'Activity Object',
  type: 'object',
  required: ['tags', 'template_id', 'form_data'],
  properties: {
    tags: {
      description: 'Tags to idenfity the activity',
      type: 'array',
      items: {
        type: 'string',
        enum: ['plant', 'animal', 'aquatic', 'terrestrial', 'invasive']
      },
      minItems: 2
    },
    template_id: {
      description: 'Specification of the UI characteristics of the form fields',
      type: 'string'
    },
    form_data: {
      description: 'Specification of the form fields and their data types/constraints.',
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
    activity_id: {
      description: 'Activity ID',
      type: 'string'
    },
    ...activity.properties
  }
};
