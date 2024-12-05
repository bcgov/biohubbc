import { ISurveySampleMethodPeriodData } from 'features/surveys/sampling-information/periods/form/sites/periods/SamplePeriodPeriodForm';

export interface ICreateSamplingPeriodSite {
  survey_sample_site_id: number;
  method_response_metric_id: number;
  sample_periods: ISurveySampleMethodPeriodData[];
}

export interface ICreateSamplingPeriodRequest {
  method_technique_id: number;
  sample_sites: ICreateSamplingPeriodSite[];
}
