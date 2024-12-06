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
  pagination: ApiPaginationResponseParams
}
