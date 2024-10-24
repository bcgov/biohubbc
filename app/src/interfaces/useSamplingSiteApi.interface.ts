import { ISurveySampleMethodFormData } from 'features/surveys/sampling-information/methods/components/SamplingMethodForm';
import { ISurveySampleMethodPeriodData } from 'features/surveys/sampling-information/periods/SamplingPeriodFormContainer';
import { Feature } from 'geojson';
import { ApiPaginationResponseParams } from 'types/misc';
import { IGetSurveyBlock, IGetSurveyStratum } from './useSurveyApi.interface';

export interface ISurveySampleSite {
  name: string;
  description: string;
  geojson: Feature;
}

export interface ISurveySampleMethod {
  survey_sample_method_id: number | null;
  survey_sample_site_id: number | null;
  method_response_metric_id: number | null;
  description: string;
  method_technique_id: number | null;
  sample_periods: ISurveySampleMethodPeriodData[];
}

export interface ICreateSamplingSiteRequest {
  survey_id: number;
  survey_sample_sites: ISurveySampleSite[]; // extracted list from shape files
  sample_methods: ISurveySampleMethod[];
  blocks: IGetSurveyBlock[];
  stratums: IGetSurveyStratum[];
}

export interface IEditSampleSiteRequest {
  sampleSite: {
    name: string;
    description: string;
    survey_id: number;
    survey_sample_sites: Feature[]; // extracted list from shape files (used for formik loading)
    geojson?: Feature; // geojson object from map (used for sending to api)
    methods: ISurveySampleMethod[];
    blocks: { survey_block_id: number }[];
    stratums: { survey_stratum_id: number }[];
  };
}

export interface IGetSampleLocationNonSpatialResponse {
  sampleSites: IGetSampleLocationNonSpatialDetails[];
  pagination: ApiPaginationResponseParams;
}

export interface IGetSampleLocationNonSpatialDetails {
  survey_sample_site_id: number;
  survey_id: number;
  name: string;
  description: string;
  geometry_type: string;
  sample_methods: IGetSampleMethodDetails[];
  blocks: IGetSampleBlockDetails[];
  stratums: IGetSampleStratumDetails[];
}

export interface IGetSampleLocationRecord {
  survey_sample_site_id: number;
  survey_id: number;
  name: string;
  description: string;
  geojson: Feature;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
}

export interface IGetSampleSiteGeometryResponse {
  sampleSites: IGetSampleSiteGeometry[];
}

export interface IGetSampleSiteGeometry {
  survey_sample_site_id: number;
  geojson: Feature;
}

export interface IGetSampleLocationDetails {
  survey_sample_site_id: number;
  survey_id: number;
  name: string;
  description: string;
  geojson: Feature;
  sample_methods: IGetSampleMethodDetails[];
  blocks: IGetSampleBlockDetails[];
  stratums: IGetSampleStratumDetails[];
}

export interface IGetBasicSamplePeriod {
  survey_sample_period_id: number;
  survey_sample_method_id: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
}

export interface IGetBasicSampleMethod {
  survey_sample_method_id: number;
  survey_sample_site_id: number;
  method_response_metric_id: number;
  technique: { survey_technique_id: number; name: string };
  sample_periods: IGetBasicSamplePeriod[];
}

export interface IGetBasicSampleLocation {
  survey_sample_site_id: number;
  name: string;
  sample_methods: IGetBasicSampleMethod;
}

export interface IGetSampleLocationDetailsForUpdate {
  survey_sample_site_id: number | null;
  survey_id: number;
  name: string;
  description: string;
  geojson: Feature;
  sample_methods: (IGetSampleMethodDetails | ISurveySampleMethodFormData)[];
  blocks: IGetSampleBlockDetails[];
  stratums: IGetSampleStratumDetails[];
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
  method_response_metric_id: number;
  description: string;
  sample_periods: IGetSamplePeriodRecord[];
}

export interface IGetSampleMethodDetails extends IGetSampleMethodRecord {
  technique: {
    method_technique_id: number;
    method_lookup_id: number;
    name: string;
    description: string;
    attractants: number[];
  };
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
