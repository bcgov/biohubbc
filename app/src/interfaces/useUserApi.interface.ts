export interface ISystemUser {
  system_user_id: number;
  user_identifier: string;
  user_guid: string | null;
  identity_source: string;
  record_end_date: string | null;
  role_ids: [number] | [];
  role_names: [string] | [];
  email: string;
  display_name: string;
  agency: string | null;
}
