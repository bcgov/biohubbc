export type IIDIRAccessRequestDataObject = {
  role: number;
  reason: string;
};

export type IBCeIDAccessRequestDataObject = {
  company: string;
  reason: string;
};

export type IAccessRequestDataObject = {
  name: string;
  username: string;
  email: string;
  identitySource: string;
} & (IIDIRAccessRequestDataObject | IBCeIDAccessRequestDataObject);

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
