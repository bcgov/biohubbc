import { z } from 'zod';

/**
 * Deployment Model.
 *
 * @description Data model for `deployment`.
 */
export const DeploymentModel = z.object({
  deployment2_id: z.number(),
  survey_id: z.number(),
  critter_id: z.number(),
  device_id: z.number(),
  device_key: z.string(),
  attachment_start: z.string(),
  attachment_end: z.string().nullable(),
  critterbase_start_capture_id: z.string().uuid().nullable(),
  critterbase_end_capture_id: z.string().uuid().nullable(),
  critterbase_end_mortality_id: z.string().uuid().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type DeploymentModel = z.infer<typeof DeploymentModel>;

/**
 * Deployment Record.
 *
 * @description Data record for `deployment`.
 */
export const DeploymentRecord = DeploymentModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type DeploymentRecord = z.infer<typeof DeploymentRecord>;
