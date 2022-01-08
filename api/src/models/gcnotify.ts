export interface IgcNotifyPostReturn {
  content: object;
  id: string;
  reference: string;
  scheduled_for: string;
  template: object;
  uri: string;
}

export interface IgcNotifyGenericMessage {
  header: string;
  body1: string;
  body2: string;
  footer: string;
}
