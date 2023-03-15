import { Feature, FeatureCollection } from 'geojson';

export interface IGetSubmissionCSVForViewItem {
  name: string;
  headers: string[];
  rows: string[][];
}

export interface IGetSubmissionCSVForViewResponse {
  data: IGetSubmissionCSVForViewItem[];
}

export type ObservationSubmissionMessageSeverityLabel = 'Notice' | 'Error' | 'Warning';

export interface IGetObservationSubmissionResponseMessages {
  severityLabel: ObservationSubmissionMessageSeverityLabel;
  messageTypeLabel: string;
  messageStatus: string;
  messages: { id: number; message: string }[];
}

/**
 * Get observation submission response object.
 *
 * @export
 * @interface IGetObservationSubmissionResponse
 */
export interface IGetObservationSubmissionResponse {
  id: number;
  inputFileName: string;
  status?: string;
  isValidating: boolean;
  messageTypes: IGetObservationSubmissionResponseMessages[];
}

export interface IGetObservationSubmissionErrorListResponse {
  id: number;
  type: string;
  status: string;
  message: string;
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
