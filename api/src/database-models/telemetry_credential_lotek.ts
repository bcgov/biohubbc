import { z } from 'zod';

/**
 * Telemetry Credential Lotek Model.
 *
 * @description Data model for `telemetry_credential_lotek`.
 */
export const TelemetryCredentialLotekModel = z.object({
  telemetry_credential_lotek_id: z.number(),
  device_key: z.string(),
  ndeviceid: z.number(),
  strspecialid: z.string().nullable(),
  dtcreated: z.string().nullable(),
  strsatellite: z.string().nullable(),
  verified_date: z.string().nullable(),
  is_valid: z.boolean().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type TelemetryLotekCredentialModel = z.infer<typeof TelemetryCredentialLotekModel>;

/**
 * Telemetry Lotek Credential Record.
 *
 * @description Data record for `telemetry_credential_lotek`.
 */
export const TelemetryLotekCredentialRecord = TelemetryCredentialLotekModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type TelemetryLotekCredentialRecord = z.infer<typeof TelemetryLotekCredentialRecord>;
