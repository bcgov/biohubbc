import {
  IGetSurveyForViewResponse,
  SurveySupplementaryData,
  SurveyViewObject
} from 'interfaces/useSurveyApi.interface';

export const surveyObject: SurveyViewObject = {
  survey_details: {
    id: 1,
    survey_name: 'survey name',
    start_date: '1998-10-10',
    end_date: '2021-02-26',
    biologist_first_name: 'first',
    biologist_last_name: 'last',
    survey_area_name: 'study area',
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
    revision_count: 0
  },
  purpose_and_methodology: {
    intended_outcome_id: 1,
    additional_details: 'details',
    field_method_id: 1,
    ecological_season_id: 1,
    vantage_code_ids: [1, 2],
    surveyed_all_areas: 'true'
  },
  proprietor: {
    proprietary_data_category_name: 'proprietor type',
    first_nations_name: 'first nations name',
    category_rationale: 'rationale',
    proprietor_name: 'prop name',
    disa_required: true
  },
  funding: {
    funding_sources: [
      {
        pfs_id: 1,
        funding_amount: 100,
        funding_start_date: '2000-04-09 11:53:53',
        funding_end_date: '2000-05-10 11:53:53',
        agency_name: 'Funding Agency Blah'
      }
    ]
  },
  // permit: {
  //   permit_number: '123',
  //   permit_type: 'Scientific'
  // },
  species: {
    focal_species: [1],
    focal_species_names: ['focal species 1'],
    ancillary_species: [2],
    ancillary_species_names: ['ancillary species 2']
  }
};

export const surveySupplementaryData: SurveySupplementaryData = {
  occurrence_submission: {
    id: null
  },
  summary_result: {
    id: null
  }
};

export const getSurveyForViewResponse: IGetSurveyForViewResponse = {
  surveyData: surveyObject,
  surveySupplementaryData: surveySupplementaryData
};
