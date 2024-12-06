import { Feature } from 'geojson';
import { ApiPaginationResponseParams } from 'types/misc';

export interface IGetSurveyBlock {
  survey_block_id: number;
  survey_id?: number;
  name: string;
  description: string;
  revision_count: number;
  geojson: Feature | null;
  sample_block_count: number;
}

export interface IGetSurveyBlockResponse {
  blocks: IGetSurveyBlock[];
  pagination: ApiPaginationResponseParams;
}

export interface ICreateBlocksRequest {
  blocks: ICreateBlock[];
}

export interface ICreateBlock {
  survey_block_id: null;
  name: string;
  description: string | null;
  geojson?: Feature | null;
  // This is an id meant for the front end only. This is set if the geojson was drawn by the user (on the leaflet map) vs imported (file upload or region selector)
  // Locations drawn by the user should be editable in the leaflet map using the draw tools available
  // Any uploaded or selected regions should not be editable and be placed in the 'static' layer on the map
  leaflet_id?: number;
  // This is used to give each location a unique ID so the list/ collapse components have a key
  uuid?: string;
}

export interface IEditBlock extends Omit<ICreateBlock, 'survey_block_id'> {
  survey_block_id: number;
}
