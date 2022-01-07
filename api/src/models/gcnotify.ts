export interface IgcNotfiyPostReturn {
  content: object;
  id: string;
  reference: string;
  scheduled_for: string;
  template: object;
  uri: string;
}

export interface IgcNotfiyGenericMessage {
  header: string;
  body1: string;
  body2: string;
  footer: string;
}
