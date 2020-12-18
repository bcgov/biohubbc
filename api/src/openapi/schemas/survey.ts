import { tags } from '../components/tags';

const survey = {
  title: 'Activity Object',
  type: 'object',
  required: ['tags'],
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
    survey_id: {
      description: 'Survey ID',
      type: 'string'
    },
    ...survey.properties
  }
};
