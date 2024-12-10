import { z } from 'zod';
import { SurveySamplePeriodRecord } from '../database-models/survey_sample_period';
import { UpdateSamplePeriodRecord } from '../repositories/sample-period-repository';

export interface ICreateSamplingPeriodData {
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
}

export interface ICreateSamplingPeriodSite {
  survey_sample_site_id: number;
  // TODO: Remove method_response_metric_id. This will be moved to techniques in a later PR.
  method_response_metric_id: number;
  sample_periods: ICreateSamplingPeriodData[];
}

export interface ICreateSamplingPeriodRequest {
  method_technique_id: number;
  sample_sites: ICreateSamplingPeriodSite[];
}

/**
 * Survey sample period record with basic details about the method and site, used for populating the edit form
 */
export const SurveySamplePeriodDetails = SurveySamplePeriodRecord.extend({
  method_technique: z.object({
    method_technique_id: z.number(),
    name: z.string(),
    description: z.string().nullable()
  }),
  survey_sample_site: z.object({
    survey_sample_site_id: z.number(),
    name: z.string()
  })
});

export type SurveySamplePeriodDetails = z.infer<typeof SurveySamplePeriodDetails>;

export interface UpdateSamplePeriodObject {
  method_technique_id: number;
  sample_period: UpdateSamplePeriodRecord;
}

export interface UpdateSampleMethodObject {
  survey_sample_method_id: number;
  method_technique_id: number;
}
