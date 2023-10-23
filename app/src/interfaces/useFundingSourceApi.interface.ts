// TODO is this supposed to have start and end date?
export interface IGetFundingSourcesResponse {
  funding_source_id: number;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  revision_count: number;
  survey_reference_count?: number;
  survey_reference_amount_total?: number;
}

export interface IGetFundingSourceResponse {
  funding_source: {
    funding_source_id: number;
    name: string;
    description: string;
    start_date: string | null;
    end_date: string | null;
    revision_count: number;
    survey_reference_count?: number;
    survey_reference_amount_total?: number;
  };
  funding_source_survey_references: {
    survey_funding_source_id: number;
    survey_id: number;
    funding_source_id: number;
    amount: number;
    revision_count: number;
    project_id: number;
    survey_name: string;
  }[];
}
