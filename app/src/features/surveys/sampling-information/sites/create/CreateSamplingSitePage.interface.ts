import { Feature } from 'geojson';
import { IPostSurveyStratum } from 'interfaces/useSurveyApi.interface';

export interface IPostSurveySampleSite {
  name: string;
  description: string | null;
  geojson: Feature;
  // Leaflet id for drawn layers
  leaflet_id?: number;
  // This is used to give each location a unique ID so the list/ collapse components have a key
  site_assignment_id: string;
}

export interface IPostSurveyBlock {
  name: string;
  description: string | null;
  geojson: Feature;
  // Leaflet id for drawn layers
  leaflet_id?: number;
  // This is used to give each location a unique ID so the list/ collapse components have a key
  block_assignment_id: string;
}

export interface IPostSiteBlockAssignment {
  site_assignment_id: string;
  block_assignment_id: string;
}
export interface IPostSiteStratumAssignment {
  site_assignment_id: string;
  stratum_assignment_id: string;
}

export interface ICreateSampleSiteFormData {
  survey_id: number;
  survey_sample_sites: IPostSurveySampleSite[];
  blocks: IPostSurveyBlock[];
  stratums: IPostSurveyStratum[];
  site_block_assignments: IPostSiteBlockAssignment[];
  site_stratum_assignments: IPostSiteStratumAssignment[];
}
