import { FeatureCollection } from 'geojson';
import yup from 'utils/YupSchema';
import { InferType } from 'yup';

export type IAnimalDeployment = InferType<typeof AnimalDeploymentSchema>;

export type IDeploymentTimespan = InferType<typeof AnimalDeploymentTimespanSchema>;

export type IAnimalTelemetryDevice = InferType<typeof AnimalTelemetryDeviceSchema>;

export type ITelemetryPointCollection = { points: FeatureCollection; tracks: FeatureCollection };

const req = 'Required.';
const mustBeNum = 'Must be a number';
const mustBePos = 'Must be positive';
const mustBeInt = 'Must be an integer';
const maxInt = 2147483647;
const numSchema = yup.number().typeError(mustBeNum).min(0, mustBePos);
const intSchema = numSchema.max(maxInt, `Must be less than ${maxInt}`).integer(mustBeInt).required(req);

export const AnimalDeploymentTimespanSchema = yup.object({}).shape({
  deployment_id: yup.string(),
  attachment_start: yup.string().isValidDateString().required(req).typeError(req),
  attachment_end: yup.string().isValidDateString().isEndDateSameOrAfterStartDate('attachment_start').nullable()
});

export const AnimalTelemetryDeviceSchema = yup.object({}).shape({
  device_id: intSchema,
  device_make: yup.string().required(req),
  frequency: numSchema.nullable(),
  frequency_unit: yup.string().nullable(),
  device_model: yup.string().nullable(),
  deployments: yup.array(AnimalDeploymentTimespanSchema)
});

export const AnimalDeploymentSchema = yup.object({}).shape({
  assignment_id: yup.string().required(),
  collar_id: yup.string().required(),
  critter_id: yup.string().required(),
  attachment_start: yup.string().isValidDateString().required(),
  attachment_end: yup.string().isValidDateString().isEndDateSameOrAfterStartDate('attachment_start'),
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
