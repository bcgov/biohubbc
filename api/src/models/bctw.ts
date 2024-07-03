import { z } from 'zod';

export const IDeployDevice = z.object({
  device_id: z.number(),
  frequency: z.number().optional(),
  frequency_unit: z.string().optional(),
  device_make: z.string().optional(),
  device_model: z.string().optional(),
  attachment_start: z.string(),
  attachment_end: z.string().nullable(),
  critter_id: z.string(),
  critterbase_start_capture_id: z.string().uuid(),
  critterbase_end_capture_id: z.string().uuid().nullable(),
  critterbase_end_mortality_id: z.string().uuid().nullable()
});

export type IDeployDevice = z.infer<typeof IDeployDevice>;

export type IDevice = Omit<IDeployDevice, 'attachment_start' | 'attachment_end' | 'critter_id'> & { collar_id: string };

export const IDeploymentUpdate = z.object({
  deployment_id: z.string(),
  attachment_start: z.string(),
  attachment_end: z.string()
});

export type IDeploymentUpdate = z.infer<typeof IDeploymentUpdate>;

export const IBctwDeploymentRecord = z.object({
  assignment_id: z.string(),
  collar_id: z.string(),
  critter_id: z.string(),
  created_at: z.string(),
  created_by_user_id: z.string(),
  updated_at: z.string(),
  updated_by_user_id: z.string(),
  valid_from: z.string(),
  valid_to: z.string(),
  attachment_start: z.string(),
  attachment_end: z.string(),
  deployment_id: z.string(),
  device_id: z.number()
});

export type IBctwDeploymentRecord = z.infer<typeof IBctwDeploymentRecord>;

export const IUploadKeyxResponse = z.object({
  errors: z.array(
    z.object({
      row: z.string(),
      error: z.string(),
      rownum: z.number()
    })
  ),
  results: z.array(
    z.object({
      idcollar: z.number(),
      comtype: z.string(),
      idcom: z.string(),
      collarkey: z.string(),
      collartype: z.number(),
      dtlast_fetch: z.string().nullable()
    })
  )
});

export type IUploadKeyxResponse = z.infer<typeof IUploadKeyxResponse>;

export const IKeyXDetails = z.object({
  device_id: z.number(),
  keyx: z
    .object({
      idcom: z.string(),
      comtype: z.string(),
      idcollar: z.number(),
      collarkey: z.string(),
      collartype: z.number()
    })
    .nullable()
});

export type IKeyXDetails = z.infer<typeof IKeyXDetails>;

export const IManualTelemetry = z.object({
  telemetry_manual_id: z.string().uuid(),
  deployment_id: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
  date: z.string()
});

export type IManualTelemetry = z.infer<typeof IManualTelemetry>;

export const IBctwUser = z.object({
  keycloak_guid: z.string(),
  username: z.string()
});

export interface ICodeResponse {
  code_header_title: string;
  code_header_name: string;
  id: number;
  code: string;
  description: string;
  long_description: string;
}

export type IBctwUser = z.infer<typeof IBctwUser>;

export interface ICreateManualTelemetry {
  deployment_id: string;
  latitude: number;
  longitude: number;
  acquisition_date: string;
}
