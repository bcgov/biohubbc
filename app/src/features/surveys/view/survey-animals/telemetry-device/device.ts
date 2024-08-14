import { AttachmentType } from 'constants/attachments';
import { DeploymentFormYupSchema } from 'features/surveys/telemetry/deployments/components/form/DeploymentForm';
import { FeatureCollection } from 'geojson';
import yup from 'utils/YupSchema';

export type IAnimalDeployment = {
  assignment_id: string;
  collar_id: string;
  critter_id: number;
  critterbase_critter_id: string;
  attachment_end_date: string | null;
  attachment_end_time: string | null;
  critterbase_start_capture_id: string;
  critterbase_end_capture_id: string | null;
  critterbase_end_mortality_id: string | null;
  deployment_id: number;
  bctw_deployment_id: string;
  device_id: number;
  device_make: string;
  device_model: string | null;
  frequency: number | null;
  frequency_unit: string | null;
  attachment_file: File | null;
  attachment_type: AttachmentType;
};

export type IAnimalTelemetryDevice = yup.InferType<typeof AnimalTelemetryDeviceSchema>;

export type ICreateAnimalDeployment = yup.InferType<typeof DeploymentFormYupSchema>;

export type IAllTelemetryPointCollection = { points: FeatureCollection; tracks: FeatureCollection };

const mustBeNum = 'Must be a number';
const mustBePos = 'Must be positive';
const mustBeInt = 'Must be an integer';
const maxInt = 2147483647;
const numSchema = yup.number().typeError(mustBeNum).min(0, mustBePos);
const intSchema = numSchema.max(maxInt, `Must be less than ${maxInt}`).integer(mustBeInt).required();

export const AnimalDeploymentTimespanSchema = yup.object({}).shape({
  deployment_id: yup.number().min(1),
  critterbase_start_capture_id: yup
    .string()
    .required('You must select an initial capture for when the deployment started'),
  critterbase_end_capture_id: yup.string().nullable(),
  critterbase_end_mortality_id: yup.string().nullable(),
  attachment_end_date: yup.string().isValidDateString().nullable(),
  attachment_end_time: yup.string().nullable()
});

export const AnimalTelemetryDeviceSchema = yup.object({}).shape({
  device_id: intSchema,
  device_make: yup.string().required('Device make is required'),
  frequency: numSchema.nullable(),
  frequency_unit: yup.string().nullable(),
  device_model: yup.string().nullable(),
  deployments: yup.array(AnimalDeploymentTimespanSchema)
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
