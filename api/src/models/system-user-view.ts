import { z } from 'zod';
import { SystemUserRecord } from '../database-models/system_user';

export interface ISystemUserFilterObject {
  system_user_ids?: number[];
  system_roles?: string[];
}

export const SystemUserWithRoles = SystemUserRecord.omit({
  user_identity_source_id: true,
  notes: true,
  record_effective_date: true
}).extend({
  identity_source: z.string(),
  role_ids: z.array(z.number()),
  role_names: z.array(z.string())
});

export type SystemUserWithRoles = z.infer<typeof SystemUserWithRoles>;

export interface IInsertUser {
  system_user_id: number;
  user_identity_source_id: number;
  user_identifier: number;
  record_effective_date: string;
  record_end_date: string;
}

export interface IGetRoles {
  system_role_id: number;
  name: string;
}

export interface UserSearchCriteria {
  keyword?: 'string';
}
