export interface IGetUserResponse {
  id: number;
  user_guid: string;
  user_record_end_date: string;
  user_identifier: string;
  identity_source: string;
  role_names: string[];
}
