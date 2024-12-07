import { ApiPaginationResponseParams } from 'types/misc';

export interface IGetBasicSamplePeriod {
  survey_sample_period_id: number;
  survey_sample_method_id: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
}

export interface IGetSamplePeriodRecord {
  survey_sample_period_id: number;
  survey_sample_method_id: number;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
}

export interface IFindSamplePeriodRecord {
  survey_sample_period_id: number;
  survey_sample_method_id: number;
  survey_id: number;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  sample_method: {
    method_response_metric_id: number;
  };
  method_technique: {
    method_technique_id: number;
    name: string;
  };
  sample_site: {
    survey_sample_site_id: number;
    name: string;
  };
}
export interface IFindSamplePeriodResponse {
  periods: IFindSamplePeriodRecord[];
  pagination: ApiPaginationResponseParams;
}

export interface IGetSamplePeriodDetails extends IGetSamplePeriodRecord {
  method_technique: { method_technique_id: number; name: string; description: string };
  survey_sample_site: { survey_sample_site_id: number; name: string };
}
