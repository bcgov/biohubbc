export class UserObject {
  system_user_id: number;
  user_identifier: string | null;
  user_guid: string | null;
  identity_source: string | null;
  record_end_date: string | null;
  role_ids: number[];
  role_names: string[];

  constructor(obj?: any) {
    this.system_user_id = obj?.system_user_id || null;
    this.user_identifier = obj?.user_identifier || null;
    this.user_guid = obj?.user_guid || '';
    this.identity_source = obj?.identity_source || null;
    this.record_end_date = obj?.record_end_date || null;
    this.role_ids = (obj?.role_ids?.length && obj.role_ids) || [];
    this.role_names = (obj?.role_names?.length && obj.role_names) || [];
  }
}
