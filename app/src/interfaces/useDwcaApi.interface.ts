import { Feature, FeatureCollection } from 'geojson';

export interface IGetSubmissionCSVForViewItem {
  name: string;
  headers: string[];
  rows: string[][];
}

export interface IGetSubmissionCSVForViewResponse {
  data: IGetSubmissionCSVForViewItem[];
}

export interface ISurveySupplementaryData {
  occurrence_submission_publish_id: number;
  occurrence_submission_id: number;
  event_timestamp: string;
  submission_uuid: string;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
}

export interface IUploadObservationSubmissionResponse {
  submissionId: number;
}

export interface IGetOccurrencesForViewResponseDetails {
  geometry: Feature | null;
  taxonId: string;
  lifeStage: string;
  vernacularName: string;
  individualCount: number;
  organismQuantity: number;
  organismQuantityType: string;
  occurrenceId: number;
  eventDate: string;
}

export type EmptyObject = Record<string, never>;

export interface ITaxaData {
  associated_taxa?: string;
  vernacular_name?: string;
  submission_spatial_component_id: number;
}

export interface ISpatialData {
  taxa_data: ITaxaData[];
  spatial_data: FeatureCollection | EmptyObject;
}
