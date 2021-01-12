import { tags } from '../components/tags';

const template = {
  title: 'Template Object',
  type: 'object',
  // required: [],
  properties: {
    tags: { ...tags },
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
    id: {
      description: 'Template ID',
      type: 'number'
    },
    ...template.properties
  }
};
