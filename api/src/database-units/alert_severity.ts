import { z } from 'zod';

/**
 * Alert Severity Data Type.
 *
 * @description Enum for `alert_severity` database type.
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success'
}

/**
 * Alert Severity Data Type.
 *
 * @description Type for `alert_severity` database type.
 */
export const AlertSeverityType = z.nativeEnum(AlertSeverity);
