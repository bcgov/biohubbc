export interface IAccessRequestDataObject {
  name: string;
  username: string;
  email: string;
  identitySource: string;
  role: number;
  company: string;
  regional_offices: number[];
  comments: string;
  request_reason: string;
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

export interface IgcNotifyGenericMessage {
  subject: string;
  header: string;
  body1: string;
  body2: string;
  footer: string;
}

export interface IgcNotifyRecipient {
  emailAddress: string;
  phoneNumber: string;
  userId: number;
}
