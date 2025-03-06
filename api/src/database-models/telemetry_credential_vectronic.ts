import { z } from 'zod';

/**
 * Telemetry Credential Vectronic Model.
 *
 * @description Data model for `telemetry_credential_vectronic`.
 */
export const TelemetryCredentialVectronicModel = z.object({
  telemetry_credential_vectronic_id: z.number(),
  device_key: z.string(),
  idcollar: z.number(),
  comtype: z.string(),
  idcom: z.string(),
  collarkey: z.string(),
  collartype: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type TelemetryCredentialVectronicModel = z.infer<typeof TelemetryCredentialVectronicModel>;

/**
 * Telemetry Credential Vectronic Record.
 *
 * @description Data record for `telemetry_credential_vectronic`.
 */
export const TelemetryCredentialVectronicRecord = TelemetryCredentialVectronicModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type TelemetryCredentialVectronicRecord = z.infer<typeof TelemetryCredentialVectronicRecord>;
