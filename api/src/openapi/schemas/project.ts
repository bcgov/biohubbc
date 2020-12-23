import { tags } from '../components/tags';

const project = {
  title: 'Activity Object',
  type: 'object',
  required: ['tags'],
  properties: {
    tags: { ...tags }
  }
};

export const projectPostBody = {
  ...project
};

export const projectResponseBody = {
  ...project,
  properties: {
    project_id: {
      description: 'Project ID',
      type: 'string'
    },
    ...project.properties
  }
};
