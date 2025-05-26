import { SURVEY_ROLE } from 'constants/roles';
import { IGetSurveyChecklistResponse } from 'interfaces/useChecklistApi.interface';
import {
  IFindSurveysResponse,
  IGetSurveyForViewResponse,
  SurveySupplementaryData,
  SurveyViewObject
} from 'interfaces/useSurveyApi.interface';
import { geoJsonFeature } from './spatial-helpers';

export const surveyObject: SurveyViewObject = {
  survey_details: {
    id: 1,
    survey_id: 1,
    survey_name: 'survey name',
    start_date: '1998-10-10',
    end_date: '2021-02-26',
    progress_id: 1,
    survey_types: [1],
    revision_count: 0
  },
  blocks: [],
  purpose_and_methodology: {
    intended_outcome_ids: [1],
    additional_details: 'details'
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
    focal_species: [
      {
        tsn: 1,
        commonNames: ['focal species 1'],
        scientificName: 'scientific name 1',
        rank: 'species',
        kingdom: 'animalia'
      }
    ]
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
      survey_job_name: 'survey job name',
      survey_role_names: [SURVEY_ROLE.ADMIN]
    }
  ],
  locations: [
    {
      survey_location_id: 1,
      name: 'study area',
      description: 'study area description',
      geometry: [geoJsonFeature],
      geojson: [geoJsonFeature],
      revision_count: 0
    }
  ]
};

export const surveySupplementaryData: SurveySupplementaryData = {
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

export const getSurveyChecklistResponse: IGetSurveyChecklistResponse = {
  checklist: {
    sampling: {
      sites: { applicable: true, count: 3, checklist_item_name: 'sites' },
      techniques: { applicable: true, count: 2, checklist_item_name: 'techniques' },
      periods: { applicable: false, count: 0, checklist_item_name: 'periods' }
    },
    data: {
      observations: { applicable: true, count: 1, checklist_item_name: 'observations' },
      telemetry: {
        devices: { applicable: true, count: 4, checklist_item_name: 'devices' },
        deployments: { applicable: true, count: 2, checklist_item_name: 'deployments' },
        locations: { applicable: false, count: 0, checklist_item_name: 'locations' }
      },
      habitat: { applicable: true, count: 5, checklist_item_name: 'habitat features' },
      animals: { applicable: false, count: 0, checklist_item_name: 'animals' }
    },
    attachments: { applicable: true, count: 1, checklist_item_name: 'attachments' },
    progress_percentage: 75
  }
};

export const getSurveyForListResponse: IFindSurveysResponse = {
  surveys: [
    {
      survey_id: 1,
      name: 'Moose Survey 1',
      start_date: '2021-04-09 11:53:53',
      end_date: '2021-05-09 11:53:53',
      progress_id: 1,
      focal_species: [1],
      focal_species_names: ['species 1'],

      regions: ['Skeena'],
      types: [1],
      progress_percentage: 50
    },
    {
      survey_id: 2,
      name: 'Moose Survey 2',
      start_date: '2021-04-09 11:53:53',
      end_date: '2021-06-10 11:53:53',
      progress_id: 1,
      focal_species: [3],
      focal_species_names: ['species 3'],

      regions: ['Skeena'],
      types: [1],
      progress_percentage: 50
    }
  ],
  pagination: {
    current_page: 1,
    last_page: 1,
    total: 2,
    order: undefined,
    sort: undefined,
    per_page: 15
  }
};
