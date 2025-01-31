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

export interface IGetSampleSiteRecordExtendedNonSpatialResponse {
  sampleSites: IGetSampleSiteRecordExtendedNonSpatial[];
  pagination: ApiPaginationResponseParams;
}

export interface IGetSampleSiteRecordExtendedNonSpatial {
  survey_sample_site_id: number;
  survey_id: number;
  name: string;
  description: string;
  geometry_type: string;
  blocks: IGetSampleBlockDetails[];
  stratums: IGetSampleStratumDetails[];
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

export interface IGetSampleSiteDetails {
  survey_sample_site_id: number;
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
  name: string;
  description: string;
}

export interface IGetSampleStratumDetails {
  survey_sample_stratum_id: number;
  survey_sample_site_id: number;
  survey_stratum_id: number;
  name: string;
  description: string;
}
