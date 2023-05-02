import { IGetObservationSubmissionResponse } from 'interfaces/useObservationApi.interface';
import {
  IGetSurveyForViewResponse,
  SurveySupplementaryData,
  SurveyViewObject
} from 'interfaces/useSurveyApi.interface';
import { geoJsonFeature } from './spatial-helpers';

export const surveyObject: SurveyViewObject = {
  survey_details: {
    id: 1,
    project_id: 1,
    survey_name: 'survey name',
    start_date: '1998-10-10',
    end_date: '2021-02-26',
    biologist_first_name: 'first',
    biologist_last_name: 'last',
    survey_area_name: 'study area',
    geometry: [geoJsonFeature],
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
    proprietor_name: 'proprietor name',
    disa_required: true,
    first_nations_id: 1,
    proprietor_type_id: 2,
    proprietor_type_name: 'proprietor type name'
  },
  funding: {
    funding_sources: [
      {
        pfs_id: 1,
        funding_amount: 100,
        funding_start_date: '2000-04-09 11:53:53',
        funding_end_date: '2000-05-10 11:53:53',
        agency_name: 'agency name',
        funding_source_project_id: 'ABC123'
      }
    ]
  },
  permit: {
    permits: [
      {
        id: 1,
        permit_number: '123',
        permit_type: 'Scientific'
      }
    ]
  },
  species: {
    focal_species: [1],
    focal_species_names: ['focal species 1'],
    ancillary_species: [2],
    ancillary_species_names: ['ancillary species 2']
  }
};

export const surveySupplementaryData: SurveySupplementaryData = {
  occurrence_submission: {
    occurrence_submission_id: 1
  },
  occurrence_submission_publish: {
    occurrence_submission_publish_id: 1,
    occurrence_submission_id: 1,
    event_timestamp: '2000-05-10 11:53:53',
    queue_id: 1,
    create_date: '2000-06-10 11:53:53',
    create_user: 1,
    update_date: null,
    update_user: null,
    revision_count: 1
  },
  survey_summary_submission: {
    survey_summary_submission_id: null
  },
  survey_summary_submission_publish: null,
  survey_metadata_publish: {
    survey_metadata_publish_id: 1,
    survey_id: 1,
    event_timestamp: '2000-11-10 11:53:53',
    queue_id: 1,
    create_date: '2000-12-10 11:53:53',
    create_user: 1,
    update_date: '2000-12-20 11:53:53',
    update_user: 1,
    revision_count: 1
  }
};

export const getSurveyForViewResponse: IGetSurveyForViewResponse = {
  surveyData: surveyObject,
  surveySupplementaryData: surveySupplementaryData
};

export const getObservationSubmissionResponse: IGetObservationSubmissionResponse = {
  surveyObservationData: {
    occurrence_submission_id: 1,
    inputFileName: 'input_file_name.txt',
    status: 'status',
    isValidating: false,
    messageTypes: []
  },
  surveyObservationSupplementaryData: {
    occurrence_submission_publish_id: 1,
    occurrence_submission_id: 2,
    event_timestamp: '2022-02-15',
    queue_id: 3,
    create_date: '2022-02-15',
    create_user: 4,
    update_date: null,
    update_user: null,
    revision_count: 0
  }
};
