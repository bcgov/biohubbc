export interface IGetUserResponse {
  system_user_id: number;
  user_guid: string | null;
  user_record_end_date: string;
  user_identifier: string;
  identity_source: string;
  role_names: string[];
}
