export interface IAccessRequestDataObject {
  name: string;
  username: string;
  identitySource: string;
  role: number;
  company: string;
  regional_offices: string[];
  comments: string;
}

export interface IGetAccessRequestsListResponse {
  id: number;
  type: number;
  type_name: string;
  status: number;
  status_name: string;
  description: string;
  notes: string;
  create_date: string;

  data: IAccessRequestDataObject;
}
