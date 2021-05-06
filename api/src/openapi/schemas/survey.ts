/**
 * Request Object for survey create POST request
 */
export const surveyCreatePostRequestObject = {
  title: 'SurveyProject post request object',
  type: 'object',
  required: [
    'survey_name',
    'start_date',
    'end_date',
    'species',
    'survey_purpose',
    'biologist_first_name',
    'biologist_last_name',
    'survey_area_name',
    'park',
    'management_unit',
    'survey_data_proprietary'
  ],
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
    },
    survey_area_name: {
      type: 'string'
    },
    park: {
      type: 'string'
    },
    management_unit: {
      type: 'string'
    },
    survey_data_proprietary: {
      type: 'string'
    },
    proprietary_data_category: {
      type: 'number'
    },
    proprietor_name: {
      type: 'string'
    },
    category_rational: {
      type: 'string'
    },
    first_nations_id: {
      type: 'number'
    },
    data_sharing_agreement_required: {
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
