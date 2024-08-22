import { AttachmentType } from 'constants/attachments';
import { DeploymentFormYupSchema } from 'features/surveys/telemetry/deployments/components/form/DeploymentForm';
import { FeatureCollection } from 'geojson';
import yup from 'utils/YupSchema';

export type IAnimalDeployment = {
  // BCTW properties

  /**
   * The ID of a BCTW collar animal assignment (aka: deployment) record.
   */
  assignment_id: string;
  /**
   * The ID of a BCTW collar record.
   */
  collar_id: string;
  /**
   * The ID of a BCTW critter record. Should match a critter_id in Critterbase.
   */
  critter_id: number;
  /**
   * The ID of a BCTW device.
   */
  device_id: number;
  /**
   * The time the deployment started.
   */
  attachment_start_date: string | null;
  /**
   * The time the deployment started.
   */
  attachment_start_time: string | null;
  /**
   * The time the deployment ended.
   */
  attachment_end_date: string | null;
  /**
   * The time the deployment ended.
   */
  attachment_end_time: string | null;
  /**
   * The ID of a BCTW deployment record.
   */
  bctw_deployment_id: string;
  /**
   * The ID of a BCTW device make record.
   */
  device_make: number;
  /**
   * The model of the device.
   */
  device_model: string | null;
  /**
   * The frequency of the device.
   */
  frequency: number | null;
  /**
   * The ID of a BCTW frequency unit record.
   */
  frequency_unit: number | null;

  // SIMS properties

  /**
   * SIMS deployment record ID
   */
  deployment_id: number;
  /**
   * Critterbase critter ID
   */
  critterbase_critter_id: string;
  /**
   * Critterbase capture ID for the start of the deployment.
   */
  critterbase_start_capture_id: string;
  /**
   * Critterbase capture ID for the end of the deployment.
   */
  critterbase_end_capture_id: string | null;
  /**
   * Critterbase mortality ID for the end of the deployment.
   */
  critterbase_end_mortality_id: string | null;
};

export type ICreateAnimalDeployment = yup.InferType<typeof DeploymentFormYupSchema>;

export interface ICreateAnimalDeploymentPostData extends Omit<ICreateAnimalDeployment, 'device_id'> {
  device_id: number;
}

export type IAllTelemetryPointCollection = { points: FeatureCollection; tracks: FeatureCollection };

export interface IAnimalTelemetryDeviceFile extends IAnimalTelemetryDevice {
  attachmentFile?: File;
  attachmentType?: AttachmentType;
}

// TODO: unused?
const mustBeNum = 'Must be a number';
const mustBePos = 'Must be positive';
const mustBeInt = 'Must be an integer';
const maxInt = 2147483647;
const numSchema = yup.number().typeError(mustBeNum).min(0, mustBePos);
const intSchema = numSchema.max(maxInt, `Must be less than ${maxInt}`).integer(mustBeInt).required();

// TODO: unused?
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

// TODO: unused?
export const AnimalTelemetryDeviceSchema = yup.object({}).shape({
  device_id: intSchema,
  device_make: yup.string().required('Device make is required'),
  frequency: numSchema.nullable(),
  frequency_unit: yup.string().nullable(),
  device_model: yup.string().nullable(),
  deployments: yup.array(AnimalDeploymentTimespanSchema)
});

// TODO: unused?
export type IAnimalTelemetryDevice = yup.InferType<typeof AnimalTelemetryDeviceSchema>;

// TODO: unused?
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
