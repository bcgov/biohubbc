import { IBlockObservationForm } from "features/observations/components/BlockObservationForm";

export interface IGetBlocksListResponse {
  id: number;
  block_id: number;
  number_of_observations: number;
  start_time: string;
  end_time: string;
}

export interface IGetObservationsListResponse {
  blocks: IGetBlocksListResponse[];
}

/**
 * Create observation post object.
 *
 * @export
 * @interface ICreateObservationRequest
 */
 export interface ICreateObservationRequest {
  metaData: IBlockObservationForm;
  tableData: any[][];
}

/**
 * Get single observation response object.
 *
 * @export
 * @interface IGetObservationResponse
 */
 export interface IGetObservationResponse {
  id: number;
  data: ICreateObservationRequest;
}
