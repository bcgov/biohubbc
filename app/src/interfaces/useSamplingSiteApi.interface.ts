import { Feature } from 'geojson';
import { ApiPaginationResponseParams } from 'types/misc';

export interface ISurveySampleSite {
  name: string;
  description: string;
  geojson: Feature;
}

export interface ICreateSamplingSiteRequest {
  survey_sample_sites: ISurveySampleSite[]; // extracted list from shape files
  blocks: {
    survey_block_id: number;
  }[];
  stratums: {
    survey_stratum_id: number;
  }[];
}

export interface IEditSampleSiteRequest {
  sampleSite: {
    name: string;
    description: string;
    geojson: Feature;
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
  blocks: IGetSampleBlockDetails[];
  stratums: IGetSampleStratumDetails[];
}

export interface IGetSampleLocationDetailsForUpdate {
  survey_sample_site_id: number | null;
  survey_id: number;
  name: string;
  description: string;
  geojson: Feature;
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
