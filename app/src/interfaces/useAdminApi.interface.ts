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
  username: string;
  email: string;
  identitySource: string;
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
