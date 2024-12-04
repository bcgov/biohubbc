import { ISurveySampleMethodPeriodData } from "features/surveys/sampling-information/periods/form/periods/SamplePeriodPeriodForm";

export interface ICreateSamplingPeriodRequest {
  survey_id: number;
  survey_sample_site_id: number;
  method_technique_id: number;
  sample_periods: ISurveySampleMethodPeriodData[];
}
