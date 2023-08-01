import { z } from 'zod';

export class UserObject {
  id: number;
  user_identifier: string;
  user_guid: string | null;
  identity_source: string;
  record_end_date: string;
  role_ids: number[];
  role_names: string[];

  constructor(obj?: any) {
    this.id = obj?.system_user_id || null;
    this.user_identifier = obj?.user_identifier || null;
    this.user_guid = obj?.user_guid || null;
    this.identity_source = obj?.identity_source || null;
    this.record_end_date = obj?.record_end_date || null;
    this.role_ids = (obj?.role_ids?.length && obj.role_ids) || [];
    this.role_names = (obj?.role_names?.length && obj.role_names) || [];
  }
}

export const ProjectUser = z.object({
  project_id: z.number(),
  system_user_id: z.number(),
  project_role_ids: z.array(z.number()),
  project_role_names: z.array(z.string()),
  project_role_permissions: z.array(z.string())
});

export type ProjectUser = z.infer<typeof ProjectUser>;
