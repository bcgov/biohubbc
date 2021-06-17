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
 */
export interface ICreateBlockObservationPostRequest {
  metaData: IBlockObservationMeta;
  tableData: IBlockObservationTableData;
}

export interface IBlockObservationMeta {
  block_name: number;
  block_size: number;
  strata: string;
  date: string;
  start_time: string;
  end_time: string;
  pilot_name: string;
  navigator: string;
  rear_left_observer: string;
  rear_right_observer: string;
  visibility: string;
  light: string;
  cloud_cover: number;
  temperature: number;
  precipitation: string;
  wind_speed: number;
  snow_cover: number;
  snow_depth: number;
  days_since_snowfall: number;
  weather_description: string;
  description_of_habitat: string;
  aircraft_company: string;
  aircraft_type: string;
  aircraft_registration_number: number;
  aircraft_gps_model: string;
  aircraft_gps_datum: string;
  aircraft_gps_readout: string;
}

export interface IBlockObservationTableData {
  data: string[][];
}

export interface ICreateBlockObservationPostResponse {
  id: number;
}
