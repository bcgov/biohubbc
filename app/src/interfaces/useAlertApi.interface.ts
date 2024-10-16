export interface IGetAlertsResponse {
  alerts: IAlert[];
}

export interface IAlert {
  alert_id: number;
  type: string;
  name: string;
  message: string;
  data: object | null;
}

export type IAlertCreateObject = Omit<IAlert, 'alert_id'>;

export type IAlertUpdateObject = IAlert
