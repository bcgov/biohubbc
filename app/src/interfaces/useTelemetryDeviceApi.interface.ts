/**
 * Create telemetry device record.
 */
export type CreateTelemetryDevice = {
  serial: string;
  device_make_id: number;
  model: string | null;
  comment: string | null;
};

/**
 * Update telemetry device record.
 */
export type UpdateTelemetryDevice = {
  serial: string;
  device_make_id: number;
  model: string | null;
  comment: string | null;
};

/**
 * Telemetry device record.
 */
export type TelemetryDevice = {
  device_id: number;
  survey_id: number;
  serial: string;
  device_make_id: number;
  model: string | null;
  comment: string | null;
};
