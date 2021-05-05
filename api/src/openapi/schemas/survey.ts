/**
 * Request Object for survey create POST request
 */
export const surveyCreatePostRequestObject = {
  title: 'SurveyProject post request object',
  type: 'object',
  required: ['survey_name', 'start_date', 'end_date', 'species', 'survey_purpose', 'biologist_first_name', 'biologist_last_name'],
  properties: {
    survey_name: {
      type: 'string'
    },
    start_date: {
      type: 'string',
      description: 'ISO 8601 date string'
    },
    end_date: {
      type: 'string',
      description: 'ISO 8601 date string'
    },
    species: {
      type: 'string',
      description: 'Selected species'
    },
    survey_purpose: {
      type: 'string'
    },
    biologist_first_name: {
      type: 'string'
    },
    biologist_last_name: {
      type: 'string'
    }
  }
};

/**
 * Basic response object for a survey.
 */
export const surveyIdResponseObject = {
  title: 'Survey Response Object',
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'number'
    }
  }
};
