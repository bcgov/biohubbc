import { tags } from '../components/tags';

const survey = {
  title: 'Activity Object',
  type: 'object',
  // required: [],
  properties: {
    tags: { ...tags }
  }
};

export const surveyPostBody = {
  ...survey
};

export const surveyResponseBody = {
  ...survey,
  properties: {
    id: {
      description: 'Survey ID',
      type: 'number'
    },
    ...survey.properties
  }
};
