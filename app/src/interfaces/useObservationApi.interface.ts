import { IBlockObservationForm } from 'features/observations/components/BlockObservationForm';

/**
 * Get single observation response object.
 *
 * @export
 * @interface IGetObservationResponse
 */
export interface IGetObservationResponse {
  id: number;
  data: {
    metaData: IBlockObservationForm;
    tableData: IBlockObservationTableData;
  };
  revision_count: number;
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
 * Create or update block observation object.
 *
 * @export
 * @interface ICreateUpdateBlockObservationRequest
 *
 */
export interface ICreateUpdateBlockObservationRequest {
  block_name: number;
  start_datetime: string;
  end_datetime: string;
  observation_count: number;
  observation_data: {
    metaData: IBlockObservationForm;
    tableData: IBlockObservationTableData;
  };
  revision_count?: number;
}

export interface IBlockObservationTableData {
  data: string[][];
}

export interface ICreateObservationPostResponse {
  id: number;
}

export interface ICreateUpdateObservationRequest {
  observation_type: string;
  observation_details_data: ICreateUpdateBlockObservationRequest;
}
