import { AttachmentType } from 'constants/attachments';
import { FeatureCollection } from 'geojson';
import yup from 'utils/YupSchema';
import { InferType } from 'yup';

export type IAnimalDeployment = InferType<typeof AnimalDeploymentSchema>;

export type IDeploymentTimespan = InferType<typeof AnimalDeploymentTimespanSchema>;

export type IAnimalTelemetryDevice = InferType<typeof AnimalTelemetryDeviceSchema>;

export type ICreateAnimalDeployment = InferType<typeof CreateAnimalDeployment>;

export type ITelemetryPointCollection = { points: FeatureCollection; tracks: FeatureCollection };

const mustBeNum = 'Must be a number';
const mustBePos = 'Must be positive';
const mustBeInt = 'Must be an integer';
const maxInt = 2147483647;
const numSchema = yup.number().typeError(mustBeNum).min(0, mustBePos);
const intSchema = numSchema.max(maxInt, `Must be less than ${maxInt}`).integer(mustBeInt).required();

export const AnimalDeploymentTimespanSchema = yup.object({}).shape({
  deployment_id: yup.string(),
  attachment_start: yup.string().isValidDateString().required().typeError('Type error'),
  attachment_end: yup.string().isValidDateString().isEndDateSameOrAfterStartDate('attachment_start').nullable()
});

export const AnimalTelemetryDeviceSchema = yup.object({}).shape({
  device_id: intSchema,
  device_make: yup.string().required('Device make is required.'),
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

export const CreateAnimalDeployment = yup.object({
  critter_id: yup.string().uuid().required('You must select the animal that the device is associated to.'), // Critterbase critter_id
  device_id: yup.string().required('You must enter device ID that identifies the device.'),
  device_make: yup.string().required('You must enter the make of the device.'),
  frequency: numSchema,
  frequency_unit: yup.string(),
  device_model: yup.string(),
  attachment_start: yup.string().isValidDateString().required('You must select a start date for the deployment.'),
  attachment_end: yup.string().isValidDateString().isEndDateSameOrAfterStartDate('attachment_start')
});

export interface ICreateAnimalDeploymentPostData extends Omit<ICreateAnimalDeployment, 'device_id'> {
  device_id: number;
}

export interface IAnimalTelemetryDeviceFile extends IAnimalTelemetryDevice {
  attachmentFile?: File;
  attachmentType?: AttachmentType;
}

export class Device implements Omit<IAnimalTelemetryDevice, 'deployments'> {
  device_id: number;
  device_make: string;
  device_model: string | null;
  frequency: number | null;
  frequency_unit: string | null;
  collar_id: string;
  constructor(obj: Record<string, unknown>) {
    this.device_id = Number(obj.device_id);
    this.device_make = String(obj.device_make);
    this.device_model = obj.device_model ? String(obj.device_model) : null;
    this.frequency = obj.frequency ? Number(obj.frequency) : null;
    this.frequency_unit = obj.frequency_unit ? String(obj.frequency_unit) : null;
    this.collar_id = String(obj.collar_id);
  }
}
