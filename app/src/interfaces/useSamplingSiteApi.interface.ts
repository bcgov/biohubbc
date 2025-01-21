import { ISurveySampleMethodFormData } from 'features/surveys/sampling-information/methods/components/SamplingMethodForm';
import { ISurveySampleMethodPeriodData } from 'features/surveys/sampling-information/periods/SamplingPeriodFormContainer';
import { Feature } from 'geojson';
import { ApiPaginationResponseParams } from 'types/misc';
import { IGetSurveyBlock } from './useBlockApi.interface';
import { IGetSurveyStratum } from './useSurveyApi.interface';

export interface ISurveySampleSite {
  name: string;
  description: string;
  geojson: Feature;
  // This is an id meant for the front end only. This is set if the geojson was drawn by the user (on the leaflet map) vs imported (file upload or region selector)
  // Locations drawn by the user should be editable in the leaflet map using the draw tools available
  // Any uploaded or selected regions should not be editable and be placed in the 'static' layer on the map
  leaflet_id?: number;
  // This is used to give each location a unique ID so the list/ collapse components have a key
  uuid?: string;
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
  survey_sample_sites: ISurveySampleSite[];
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

export interface IFindSampleSiteResponse {
  sites: {
    survey_sample_site_id: number;
    survey_id: number;
    name: string;
    description: string | null;
    geometry_type: string;
    blocks: IGetSampleBlockDetails[];
    stratums: IGetSampleStratumDetails[];
  }[];
  pagination: ApiPaginationResponseParams;
}

export interface IFindSampleSiteRecord {
  survey_sample_site_id: number;
  survey_id: number;
  name: string;
  description: string | null;
  geometry_type: string;
  blocks: IGetSampleBlockDetails[];
  stratums: IGetSampleStratumDetails[];
}
export interface IFindSampleSiteResponse {
  sites: IFindSampleSiteRecord[];
  pagination: ApiPaginationResponseParams;
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
  //   create_date: string;
  //   create_user: number;
  //   update_date: string | null;
  //   update_user: number | null;
  //   revision_count: number;
  name: string;
  description: string;
}

export interface IGetSampleStratumDetails {
  survey_sample_stratum_id: number;
  survey_sample_site_id: number;
  survey_stratum_id: number;
  //   create_date: string;
  //   create_user: number;
  //   update_date: string | null;
  //   update_user: number | null;
  //   revision_count: number;
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

export interface IFindSamplePeriodRecord {
  survey_sample_period_id: number;
  survey_sample_method_id: number;
  survey_id: number;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  sample_method: {
    method_response_metric_id: number;
  };
  method_technique: {
    method_technique_id: number;
    name: string;
  };
  sample_site: {
    survey_sample_site_id: number;
    name: string;
  };
}
export interface IFindSamplePeriodResponse {
  periods: IFindSamplePeriodRecord[];
  pagination: ApiPaginationResponseParams;
}
