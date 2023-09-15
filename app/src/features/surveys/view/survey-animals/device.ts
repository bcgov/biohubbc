import yup from 'utils/YupSchema';
import { InferType } from 'yup';

export type IAnimalDeployment = InferType<typeof AnimalDeploymentSchema>;

export type IDeploymentTimespan = InferType<typeof AnimalDeploymentTimespanSchema>;

export type IAnimalTelemetryDevice = InferType<typeof AnimalTelemetryDeviceSchema>;

const req = 'Required.';
const mustBeNum = 'Must be a number';
const numSchema = yup.number().typeError(mustBeNum);

export const AnimalDeploymentTimespanSchema = yup.object({}).shape({
  deployment_id: yup.string().required(req),
  attachment_start: yup.string().required(req),
  attachment_end: yup.string()
});

export const AnimalTelemetryDeviceSchema = yup.object({}).shape({
  device_id: numSchema.required(req),
  device_make: yup.string().required(req),
  frequency: numSchema,
  frequency_unit: yup.string(),
  device_model: yup.string(),
  deployments: yup.array(AnimalDeploymentTimespanSchema)
});

export const AnimalDeploymentSchema = yup.object({}).shape({
  assignment_id: yup.string().required(),
  collar_id: yup.string().required(),
  critter_id: yup.string().required(),
  attachment_start: yup.string().required(),
  attachment_end: yup.string(),
  deployment_id: yup.string().required(),
  device_id: yup.number().required(),
  device_make: yup.string().required(),
  device_model: yup.string(),
  frequency: numSchema,
  frequency_unit: yup.string()
});

export class Device implements Omit<IAnimalTelemetryDevice, 'deployments'> {
  device_id: number;
  device_make: string;
  device_model: string;
  frequency: number;
  frequency_unit: string;
  collar_id: string;
  constructor(obj: Record<string, unknown>) {
    this.device_id = Number(obj.device_id);
    this.device_make = String(obj.device_make);
    this.device_model = String(obj.device_model);
    this.frequency = Number(obj.frequency);
    this.frequency_unit = String(obj.frequency_unit);
    this.collar_id = String(obj.collar_id);
  }
}
