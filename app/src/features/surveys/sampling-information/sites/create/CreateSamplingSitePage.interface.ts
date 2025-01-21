import { Feature } from 'geojson';

export interface IPostSurveySampleSite {
  name: string;
  description: string;
  geojson: Feature;
  // Leaflet id for drawn layers
  leaflet_id?: number;
  // This is used to give each location a unique ID so the list/ collapse components have a key
  uuid?: string;
}

export interface IPostSurveyBlock {
  name: string;
  description: string | null;
  geojson: Feature;
  // Leaflet id for drawn layers
  leaflet_id?: number;
  // This is used to give each location a unique ID so the list/ collapse components have a key
  uuid?: string;
}

export interface IPostSiteBlockAssignment {
  survey_sample_site_assignment_id: string;
  block_assignment_id: string;
}

export interface ICreateSampleSiteFormData {
  survey_id: number;
  survey_sample_sites: IPostSurveySampleSite[];
  blocks: IPostSurveyBlock[];
  site_block_assignments: IPostSiteBlockAssignment[];
}