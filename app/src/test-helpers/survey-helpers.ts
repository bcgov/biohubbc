import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';

export const getSurveyForViewResponse: IGetSurveyForViewResponse = {
  survey_details: {
    id: 1,
    occurrence_submission_id: null,
    survey_name: 'survey name',
    focal_species: ['focal species 1'],
    ancillary_species: ['ancillary species 1'],
    start_date: '1998-10-10',
    end_date: '2021-02-26',
    biologist_first_name: 'first',
    biologist_last_name: 'last',
    survey_area_name: 'study area',
    permit_number: '123',
    permit_type: 'Scientific',
    funding_sources: [
      {
        pfs_id: 1,
        funding_amount: 100,
        funding_start_date: '2000-04-09 11:53:53',
        funding_end_date: '2000-05-10 11:53:53',
        agency_name: 'Funding Agency Blah'
      }
    ],
    geometry: [
      {
        type: 'Feature',
        id: 'myGeo',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-128, 55],
              [-128, 55.5],
              [-128, 56],
              [-126, 58],
              [-128, 55]
            ]
          ]
        },
        properties: {
          name: 'Biohub Islands'
        }
      }
    ],
    completion_status: 'Active',
    publish_date: (null as unknown) as string
  },
  survey_purpose_and_methodology:{
    id: 1,
    intended_outcome: 1,
    field_method: 1,
    ecological_season: 1,
    vantage_codes:[1,2]
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
