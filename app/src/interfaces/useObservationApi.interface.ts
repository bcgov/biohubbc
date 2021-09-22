import { Feature } from 'geojson';

export interface IGetSubmissionCSVForViewItem {
  name: string;
  headers: string[];
  rows: string[][];
}

export interface IGetSubmissionCSVForViewResponse {
  data: IGetSubmissionCSVForViewItem[];
}

interface IGetObservationSubmissionResponseMessages {
  id: number;
  status: string;
  class: string;
  type: string;
  message: string;
}

/**
 * Get observation submission response object.
 *
 * @export
 * @interface IGetObservationSubmissionResponse
 */
export interface IGetObservationSubmissionResponse {
  id: number;
  fileName: string;
  status: string;
  messages: IGetObservationSubmissionResponseMessages[];
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
  geometry: Feature;
  taxonId: string;
  lifeStage: string;
  vernacularName: string;
  individualCount: number;
  organismQuantity: number;
  organismQuantityType: string;
}
