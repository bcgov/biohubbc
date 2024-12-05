export interface ICreateSamplingPeriodData {
  survey_sample_method_id: number | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
}

export interface ICreateSamplingPeriodSite {
  survey_sample_site_id: number;
  // TODO: Remove method_response_metric_id. This will be moved to techniques.
  method_response_metric_id: number;
  sample_periods: ICreateSamplingPeriodData[];
}

export interface ICreateSamplingPeriodRequest {
  method_technique_id: number;
  sample_sites: ICreateSamplingPeriodSite[];
}
