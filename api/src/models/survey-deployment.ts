import { z } from 'zod';

export const SurveyDeployment = z.object({
  deployment_id: z.number().int(),
  critter_id: z.number(),
  critterbase_critter_id: z.string().optional(),
  bctw_deployment_id: z.string().uuid(),
  critterbase_start_capture_id: z.string().uuid().nullable(),
  critterbase_end_capture_id: z.string().uuid().nullable(),
  critterbase_end_mortality_id: z.string().uuid().nullable()
});

export type SurveyDeployment = z.infer<typeof SurveyDeployment>;

export interface IPostSurveyDeployment extends Omit<SurveyDeployment, 'deployment_id' | 'critterbase_critter_id'> {}
