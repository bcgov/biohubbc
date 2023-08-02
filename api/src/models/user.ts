import { z } from 'zod';

export const User = z.object({
  system_user_id: z.number(),
  user_identifier: z.string(),
  user_guid: z.string().nullable(),
  identity_source: z.string(),
  record_end_date: z.date().nullable(),
  role_ids: z.array(z.number()),
  role_names: z.array(z.string()),
  permission_ids: z.array(z.number()),
  permission_names: z.array(z.string())
});

export type User = z.infer<typeof User>;

export const ProjectUser = z.object({
  project_id: z.number(),
  system_user_id: z.number(),
  project_role_ids: z.array(z.number()),
  project_role_names: z.array(z.string()),
  project_role_permissions: z.array(z.string())
});

export type ProjectUser = z.infer<typeof ProjectUser>;
