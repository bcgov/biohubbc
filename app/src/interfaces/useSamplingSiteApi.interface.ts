import { ISurveySampleMethodData } from 'features/surveys/observations/sampling-sites/create/form/MethodCreateForm';
import { ISurveySampleSite } from 'features/surveys/observations/sampling-sites/create/SamplingSitePage';
import { Feature } from 'geojson';
import { IGetSurveyBlock, IGetSurveyStratum } from './useSurveyApi.interface';

export interface IEditSamplingSiteRequest {
  sampleSite: {
    name: string;
    description: string;
    survey_id: number;
    survey_sample_sites: Feature[]; // extracted list from shape files (used for formik loading)
    geojson?: Feature; // geojson object from map (used for sending to api)
    methods: ISurveySampleMethodData[];
    blocks: number[];
    stratums: number[];
  };
}

export interface ICreateSamplingSiteRequest {
  survey_id: number;
  survey_sample_sites: ISurveySampleSite[]; // extracted list from shape files
  sample_methods: ISurveySampleMethodData[];
  blocks: IGetSurveyBlock[];
  stratums: IGetSurveyStratum[];
}

export interface IGetSampleSiteResponse {
  sampleSites: IGetSampleLocationDetails[];
}

export interface IGetSampleLocationRecord {
  survey_sample_site_id: number;
  survey_id: number;
  name: string;
  description: string;
  geojson: Feature;
  geography: string;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
}

export interface IGetSampleLocationDetails {
  survey_sample_site_id: number;
  survey_id: number;
  name: string;
  description: string;
  geojson: Feature;
  geography: string;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
  sample_methods: IGetSampleMethodRecord[];
  sample_blocks: IGetSampleBlockDetails[];
  sample_stratums: IGetSampleStratumDetails[];
}

export interface IGetSampleLocationDetailsForUpdate {
  survey_sample_site_id: number | null;
  survey_id: number;
  name: string;
  description: string;
  geojson: Feature;
  geography: string;
  revision_count: number;
  sample_methods: IGetSampleMethodRecord[] | ISurveySampleMethodData[];
  sample_blocks: IGetSampleBlockDetails[];
  sample_stratums: IGetSampleStratumDetails[];
}

export interface IGetSampleBlockDetails {
  survey_sample_block_id: number;
  survey_sample_site_id: number | null;
  survey_block_id: number;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
  name: string;
  description: string;
}

export interface IGetSampleStratumDetails {
  survey_sample_stratum_id: number;
  survey_sample_site_id: number;
  survey_stratum_id: number;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
  name: string;
  description: string;
}

export interface IGetSampleMethodRecord {
  survey_sample_method_id: number;
  survey_sample_site_id: number;
  method_lookup_id: number;
  method_response_metric_id: number;
  description: string;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
  sample_periods: IGetSamplePeriodRecord[];
}

export interface IGetSamplePeriodRecord {
  survey_sample_period_id: number;
  survey_sample_method_id: number;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
}
