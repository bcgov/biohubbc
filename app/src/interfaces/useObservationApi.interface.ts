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
 * Create/Update observation post/put object.
 *
 * @export
 * @interface ICreateUpdateObservationRequest
 */
export interface ICreateUpdateObservationRequest {
  entity: string;
  block_name: string;
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
