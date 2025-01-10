import { ApiPaginationResponseParams } from 'types/misc';

export type CreateSamplingPeriod =
  | {
      // At least survey sample site is not null
      survey_sample_site_id: number;
      method_technique_id: number | null;
      start_date: string | null;
      start_time: string | null;
      end_date: string | null;
      end_time: string | null;
    }
  | {
      // At least method technique is not null
      survey_sample_site_id: number | null;
      method_technique_id: number;
      start_date: string | null;
      start_time: string | null;
      end_date: string | null;
      end_time: string | null;
    }
  | {
      // At least start/end date are not null
      survey_sample_site_id: number | null;
      method_technique_id: number | null;
      start_date: string;
      start_time: string | null;
      end_date: string;
      end_time: string | null;
    };

export type GetSamplingPeriod = {
  survey_sample_period_id: number;
  survey_id: number;
} & (
  | {
      // At least survey sample site is not null
      survey_sample_site_id: number;
      method_technique_id: number | null;
      start_date: string | null;
      start_time: string | null;
      end_date: string | null;
      end_time: string | null;
      survey_sample_site: {
        survey_sample_site_id: number;
        name: string;
      };
      method_technique: {
        method_technique_id: number;
        name: string;
        description: string | null;
        method_response_metric_id: number;
      } | null;
    }
  | {
      // At least method technique is not null
      survey_sample_site_id: number | null;
      method_technique_id: number;
      start_date: string | null;
      start_time: string | null;
      end_date: string | null;
      end_time: string | null;
      survey_sample_site: {
        survey_sample_site_id: number;
        name: string;
      } | null;
      method_technique: {
        method_technique_id: number;
        name: string;
        description: string | null;
        method_response_metric_id: number;
      };
    }
  | {
      // At least start/end date are not null
      survey_sample_site_id: number | null;
      method_technique_id: number | null;
      start_date: string;
      start_time: string | null;
      end_date: string;
      end_time: string | null;
      survey_sample_site: {
        survey_sample_site_id: number;
        name: string;
      } | null;
      method_technique: {
        method_technique_id: number;
        name: string;
        description: string | null;
        method_response_metric_id: number;
      } | null;
    }
);

export type GetSamplingPeriodsPaginated = {
  periods: GetSamplingPeriod[];
  pagination: ApiPaginationResponseParams;
};

export type FindSamplingPeriod = GetSamplingPeriod;

export type FindSamplingPeriods = {
  periods: FindSamplingPeriod[];
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
