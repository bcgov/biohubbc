const template = {
  title: 'Template Object',
  type: 'object',
  required: ['name', 'description', 'tags', 'data_template', 'ui_template'],
  properties: {
    name: {
      description: 'Template name',
      type: 'string',
      maxLength: 100,
      example: '2020 General Ungulete Observation Form'
    },
    description: {
      description: 'Template description',
      type: 'string',
      maxLength: 300
    },
    tags: {
      description: 'Tags to idenfity the template',
      type: 'array',
      items: {
        type: 'string',
        enum: ['plant', 'animal', 'aquatic', 'terrestrial', 'invasive']
      },
      minItems: 2
    },
    data_template: {
      description: 'Specification of the form fields and their data types/constraints.',
      type: 'object'
    },
    ui_template: {
      description: 'Specification of the UI characteristics of the form fields',
      type: 'object'
    }
  }
};

export const templatePostBody = {
  ...template
};

export const templateResponseBody = {
  ...template,
  properties: {
    template_id: {
      description: 'Template ID',
      type: 'string'
    },
    ...template.properties
  }
};
