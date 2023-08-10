// TODO is this supposed to have start and end date?
export interface IGetFundingSourcesResponse {
  funding_source_id: number;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  revision_count: number;
  survey_reference_count: number;
  survey_reference_amount_total: number;
}

export interface IGetFundingSourceResponse {
  funding_source_id: number;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  revision_count: number;
}
