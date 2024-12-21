import { ApiPaginationResponseParams } from 'types/misc';

export type CreateSamplingPeriod = {
  survey_sample_site_id: number;
  method_technique_id: number;
  start_date: string;
  start_time: string | null;
  end_date: string;
  end_time: string | null;
};

export type GetSamplingPeriod = {
  survey_sample_period_id: number;
  survey_sample_site_id: number;
  method_technique_id: number;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  method_technique: {
    method_technique_id: number;
    name: string;
    description: string | null;
    method_response_metric_id: number;
  };
  survey_sample_site: {
    survey_sample_site_id: number;
    name: string;
  };
};

export type GetSamplingPeriodsPaginated = {
  samplePeriods: GetSamplingPeriod[];
  pagination: ApiPaginationResponseParams;
};

export type FindSamplingPeriod = {
  survey_sample_period_id: number;
  survey_sample_site_id: number;
  method_technique_id: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  method_technique: {
    method_technique_id: number;
    name: string;
  };
  sample_site: {
    survey_sample_site_id: number;
    name: string;
  };
};

export type FindSamplingPeriods = {
  samplePeriods: FindSamplingPeriod[];
  pagination: ApiPaginationResponseParams;
};

export type UpdateSamplingPeriod = {
  survey_sample_period_id?: number;
  survey_sample_site_id: number;
  method_technique_id: number;
  start_date: string;
  start_time: string | null;
  end_date: string;
  end_time: string | null;
};
