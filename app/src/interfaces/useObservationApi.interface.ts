import { IBlockObservationForm } from 'features/observations/components/BlockObservationForm';

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
  tableData: IBlockObservationTableData;
}

export interface IBlockObservationTableData {
  data: string[][];
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
 * Create blockObservation post object.
 *
 * @export
 * @interface ICreateBlockObservationPostRequest
 *
 */
export interface ICreateBlockObservationPostRequest {
  block_name: number;
  start_datetime: string;
  end_datetime: string;
  observation_count: number;
  observation_data: {
    metaData: IBlockObservationForm;
    tableData: IBlockObservationTableData;
  };
}

export interface IBlockObservationTableData {
  data: string[][];
}

export interface ICreateObservationPostResponse {
  id: number;
}

export interface ICreateObservationPostRequest {
  observation_type: string;
  observation_post_data: ICreateBlockObservationPostRequest;
}
