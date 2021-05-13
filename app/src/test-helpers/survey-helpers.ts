import { IGetProjectSurveyForViewResponse } from 'interfaces/useProjectApi.interface';

export const getProjectSurveyForViewResponse: IGetProjectSurveyForViewResponse = {
  id: 1,
  survey: {
    survey_name: 'survey name',
    survey_purpose: 'survey purpose',
    species: 'species',
    start_date: '1998-10-10',
    end_date: '2021-02-26',
    biologist_first_name: 'first',
    biologist_last_name: 'last',
    survey_area_name: 'study area',
    geometry: []
  },
  surveyProprietor: {
    proprietor_type_name: 'proprietor type',
    first_nations_name: 'first nations name',
    category_rationale: 'rationale',
    proprietor_name: 'prop name',
    data_sharing_agreement_required: 'true'
  }
};
