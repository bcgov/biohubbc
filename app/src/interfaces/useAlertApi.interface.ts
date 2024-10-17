export interface IGetAlertsResponse {
  alerts: IAlert[];
}

export type AlertSeverity = 'info' | 'warning' | 'error' | 'warning'
export interface IAlert {
  alert_id: number;
  alert_type_id: number;
  severity: AlertSeverity;
  name: string;
  message: string;
  data: object | null;
  record_end_date: string | null;
  status: 'expired' | 'active';
}

export type IAlertCreateObject = Omit<IAlert, 'alert_id' | 'status'>;

export type IAlertUpdateObject = Omit<IAlert, 'status'>;

export interface IAlertFilterParams {
  recordEndDate?: string;
  types?: string[];
}
