export type IIDIRAccessRequestDataObject = {
  role: number;
  reason: string;
};

export type IBCeIDBasicAccessRequestDataObject = {
  reason: string;
};

export type IBCeIDBusinessAccessRequestDataObject = {
  company: string;
  reason: string;
};

export type IAccessRequestDataObject = {
  name: string;
  userGuid: string | null;
  username: string;
  email: string;
  identitySource: string;
  displayName: string;
} & (IIDIRAccessRequestDataObject | IBCeIDBasicAccessRequestDataObject | IBCeIDBusinessAccessRequestDataObject);

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

export interface IGetAdministrativeActivityStanding {
  has_pending_access_request: boolean;
  has_one_or_more_project_roles: boolean;
}

export interface IgcNotifyGenericMessage {
  subject: string;
  header: string;
  main_body1: string;
  main_body2: string;
  footer: string;
}

export interface IgcNotifyRecipient {
  emailAddress: string;
  phoneNumber: string;
  userId: number;
}
