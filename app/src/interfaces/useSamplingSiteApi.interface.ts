import { Feature } from 'geojson';
import { ApiPaginationResponseParams } from 'types/misc';

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
