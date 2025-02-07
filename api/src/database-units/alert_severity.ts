import { z } from 'zod';

/**
 * Alert Severity Data Type.
 *
 * @description Data type for `alert_severity`.
 */
export const AlertSeverity = z.enum(['info', 'warning', 'error', 'success']);

export type AlertSeverity = z.infer<typeof AlertSeverity>;
