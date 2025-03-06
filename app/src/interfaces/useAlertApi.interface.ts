import { ApiPaginationResponseParams } from 'types/misc';

export interface IGetAlertsResponse {
  alerts: IAlert[];
  pagination: ApiPaginationResponseParams;
}

export type AlertSeverity = 'info' | 'success' | 'error' | 'warning';
export interface IAlert {
  alert_id: number;
  alert_type_id: number;
  severity: AlertSeverity;
  name: string;
  message: string;
  data: object | null;
  record_end_date: string | null;
  status: 'expired' | 'active';
  create_date: string;
}

export interface IAlertCreateObject {
  alert_type_id: number;
  severity: AlertSeverity;
  name: string;
  message: string;
  data: object | null;
  record_end_date: string | null;
}

export interface IAlertUpdateObject extends IAlertCreateObject {
  alert_id: number;
}

export interface IAlertFilterParams {
  expiresBefore?: string;
  expiresAfter?: string;
  types?: SystemAlertBannerEnum[];
}

export enum SystemAlertBannerEnum {
  SUMMARY = 'Summary',
  TELEMETRY = 'Manage Telemetry',
  OBSERVATIONS = 'Manage Observations',
  ANIMALS = 'Manage Animals',
  SAMPLING = 'Manage Sampling',
  PROJECTS = 'Project',
  SURVEYS = 'Survey',
  STANDARDS = 'Standards',
  ADMINISTRATOR = 'Administrator',
  FUNDING = 'Funding'
}
