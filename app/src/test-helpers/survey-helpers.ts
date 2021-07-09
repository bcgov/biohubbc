import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';

export const getSurveyForViewResponse: IGetSurveyForViewResponse = {
  survey_details: {
    id: 1,
    survey_name: 'survey name',
    survey_purpose: 'survey purpose',
    focal_species: ['focal species 1'],
    ancillary_species: ['ancillary species 1'],
    start_date: '1998-10-10',
    end_date: '2021-02-26',
    biologist_first_name: 'first',
    biologist_last_name: 'last',
    survey_area_name: 'study area',
    permit_number: '123',
    geometry: [],
    completion_status: 'Active',
    publish_date: (null as unknown) as string
  },
  survey_proprietor: {
    id: 23,
    proprietary_data_category_name: 'proprietor type',
    first_nations_name: 'first nations name',
    category_rationale: 'rationale',
    proprietor_name: 'prop name',
    data_sharing_agreement_required: 'true'
  }
};
