import { PublishStatus } from 'constants/attachments';
import { IGetObservationSubmissionResponse } from 'interfaces/useDwcaApi.interface';
import {
  IGetSurveyForListResponse,
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
    survey_types: [1],
    revision_count: 0
  },
  blocks: [],
  purpose_and_methodology: {
    intended_outcome_ids: [1],
    additional_details: 'details',
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
  permit: {
    permits: [
      {
        permit_id: 1,
        permit_number: '123',
        permit_type: 'Scientific'
      }
    ]
  },
  funding_sources: [
    {
      funding_source_id: 1,
      amount: 1000,
      revision_count: 0,
      survey_id: 1,
      survey_funding_source_id: 1,
      funding_source_name: 'funding source name'
    }
  ],
  partnerships: {
    indigenous_partnerships: [1, 2],
    stakeholder_partnerships: ['partner 3', 'partner 4']
  },
  species: {
    focal_species: [1],
    focal_species_names: ['focal species 1'],
    ancillary_species: [2],
    ancillary_species_names: ['ancillary species 2']
  },
  site_selection: {
    strategies: [],
    stratums: []
  },
  participants: [
    {
      system_user_id: 1,
      identity_source: 'identity source',
      email: 'email',
      display_name: 'display name',
      agency: 'agency',
      survey_job_id: 1,
      survey_job_name: 'survey job name'
    }
  ],
  locations: [
    {
      survey_location_id: 1,
      name: 'study area',
      description: 'study area description',
      geometry: [geoJsonFeature],
      geography: null,
      geojson: [geoJsonFeature],
      revision_count: 0
    }
  ]
};

export const surveySupplementaryData: SurveySupplementaryData = {
  occurrence_submission: {
    occurrence_submission_id: 1
  },
  occurrence_submission_publish: {
    occurrence_submission_publish_id: 1,
    occurrence_submission_id: 1,
    event_timestamp: '2000-05-10 11:53:53',
    submission_uuid: '123-456-789',
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
    submission_uuid: '123-456-789',
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
    submission_uuid: '123-456-789',
    create_date: '2022-02-15',
    create_user: 4,
    update_date: null,
    update_user: null,
    revision_count: 0
  }
};

export const getSurveyForListResponse: IGetSurveyForListResponse[] = [
  {
    surveyData: {
      survey_id: 1,
      name: 'Moose Survey 1',
      start_date: '2021-04-09 11:53:53',
      end_date: '2021-05-09 11:53:53',
      focal_species: [1],
      focal_species_names: ['species 1']
    },
    surveySupplementaryData: {
      publishStatus: PublishStatus.NO_DATA
    }
  },
  {
    surveyData: {
      survey_id: 2,
      name: 'Moose Survey 2',
      start_date: '2021-04-09 11:53:53',
      end_date: '2021-06-10 11:53:53',
      focal_species: [3],
      focal_species_names: ['species 3']
    },
    surveySupplementaryData: {
      publishStatus: PublishStatus.NO_DATA
    }
  }
];
