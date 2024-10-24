/**
 * Create telemetry deployment record.
 */
export type CreateTelemetryDeployment = {
  device_id: number;
  frequency: number | null;
  frequency_unit_id: number | null;
  attachment_start_date: string;
  attachment_start_time: string | null;
  attachment_end_date: string | null;
  attachment_end_time: string | null;
  critterbase_start_capture_id: string;
  critterbase_end_capture_id: string | null;
  critterbase_end_mortality_id: string | null;
};

/**
 * Update telemetry deployment record.
 */
export type UpdateTelemetryDeployment = {
  critter_id: number;
  device_id: number;
  frequency: number | null;
  frequency_unit_id: number | null;
  attachment_start_date: string;
  attachment_start_time: string | null;
  attachment_end_date: string | null;
  attachment_end_time: string | null;
  critterbase_start_capture_id: string;
  critterbase_end_capture_id: string | null;
  critterbase_end_mortality_id: string | null;
};

/**
 * Telemetry deployment record.
 */
export type TelemetryDeployment = {
  // deployment data
  deployment2_id: number;
  survey_id: number;
  critter_id: number;
  device_id: number;
  frequency: number | null;
  frequency_unit_id: number | null;
  attachment_start_date: string;
  attachment_start_time: string | null;
  attachment_end_date: string | null;
  attachment_end_time: string | null;
  critterbase_start_capture_id: string;
  critterbase_end_capture_id: string | null;
  critterbase_end_mortality_id: string | null;
  // device data
  device_make_id: number;
  model: string | null;
  // critter data
  critterbase_critter_id: string;
};
