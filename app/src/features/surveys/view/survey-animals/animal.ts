import yup from 'utils/YupSchema';
import { InferType } from 'yup';

/**
 * Provides an acceptable amount of type security with formik field names for animal forms
 * Returns formatted field name in regular or array format
 */

export const getAnimalFieldName = <T>(animalKey: keyof IAnimal, fieldKey: keyof T, idx?: number) => {
  return idx === undefined ? `${animalKey}.${String(fieldKey)}` : `${animalKey}.${idx}.${String(fieldKey)}`;
};

const req = 'Required';
const mustBeNum = 'Must be a number';

const glt = (num: number, greater = true) => `Must be ${greater ? 'greater' : 'less'} than or equal to ${num}`;

const numSchema = yup.number().typeError(mustBeNum);
const latSchema = yup.number().min(-90, glt(-90)).max(90, glt(90, false)).typeError(mustBeNum);
const lonSchema = yup.number().min(-180, glt(-180)).max(180, glt(180, false)).typeError(mustBeNum);

const AnimalGeneralSchema = yup.object({}).shape({
  taxon_id: yup.string().required(req),
  animal_id: yup.string(),

  taxon_name: yup.string()
});

const AnimalCaptureSchema = yup.object({}).shape({
  capture_longitude: lonSchema.required(req),
  capture_latitude: latSchema.required(req),
  capture_utm_northing: numSchema,
  capture_utm_easting: numSchema,
  capture_timestamp: yup.date().required(req),
  capture_coordinate_uncertainty: numSchema,
  capture_comment: yup.string(),
  release_longitude: lonSchema,
  release_latitude: latSchema,
  release_utm_northing: numSchema,
  release_utm_easting: numSchema,
  release_coordinate_uncertainty: numSchema,
  release_timestamp: yup.date(),
  release_comment: yup.string(),
  projection_mode: yup.mixed().oneOf(['wgs', 'utm'])
});

export const AnimalMarkingSchema = yup.object({}).shape({
  marking_type_id: yup.string().required(req),
  marking_body_location_id: yup.string().required(req),
  primary_colour_id: yup.string(),
  secondary_colour_id: yup.string(),
  marking_comment: yup.string()
});

const AnimalMeasurementSchema = yup.object({}).shape({
  taxon_measurement_id: yup.string().required(req),
  value: numSchema,
  option_id: yup.string(),
  measured_timestamp: yup.date().required(req),
  measurement_comment: yup.string()
});

const AnimalMortalitySchema = yup.object({}).shape({
  mortality_longitude: lonSchema.required(req),
  mortality_latitude: latSchema.required(req),
  mortality_utm_northing: numSchema,
  mortality_utm_easting: numSchema,
  mortality_timestamp: yup.date().required(req),
  mortality_coordinate_uncertainty: numSchema,
  mortality_comment: yup.string(),
  mortality_pcod_reason: yup.string().uuid().required(req),
  mortality_pcod_confidence: yup.string(),
  mortality_pcod_taxon_id: yup.string().uuid(),
  mortality_ucod_reason: yup.string().uuid(),
  mortality_ucod_confidence: yup.string(),
  mortality_ucod_taxon_id: yup.string().uuid(),
  projection_mode: yup.mixed().oneOf(['wgs', 'utm'])
});

const AnimalRelationshipSchema = yup.object({}).shape({
  critter_id: yup.string().uuid('Must be a UUID').required(req),
  relationship: yup.mixed().oneOf(['Parent', 'Child', 'Sibling']).required(req)
});

const AnimalTelemetryDeviceSchema = yup.object({}).shape({
  device_id: yup.string().required(req),
  manufacturer: yup.string().required(req),
  //I think this needs an additional field for hz
  device_frequency: numSchema.required(req),
  model: yup.string().required(req)
});

const AnimalImageSchema = yup.object({}).shape({});

export const AnimalSchema = yup.object({}).shape({
  general: AnimalGeneralSchema.required(),
  captures: yup.array().of(AnimalCaptureSchema).required(),
  markings: yup.array().of(AnimalMarkingSchema).required(),
  measurements: yup.array().of(AnimalMeasurementSchema).required(),
  mortality: yup.array().of(AnimalMortalitySchema).required(),
  family: yup.array().of(AnimalRelationshipSchema).required(),
  images: yup.array().of(AnimalImageSchema).required(),
  device: AnimalTelemetryDeviceSchema.default(undefined)
});

export type IAnimalGeneral = InferType<typeof AnimalGeneralSchema>;

export type IAnimalCapture = InferType<typeof AnimalCaptureSchema>;

export type IAnimalMarking = InferType<typeof AnimalMarkingSchema>;

export type IAnimalMeasurement = InferType<typeof AnimalMeasurementSchema>;

export type IAnimalMortality = InferType<typeof AnimalMortalitySchema>;

export type IAnimalRelationship = InferType<typeof AnimalRelationshipSchema>;

export type IAnimalTelemetryDevice = InferType<typeof AnimalTelemetryDeviceSchema>;

export type IAnimalImage = InferType<typeof AnimalImageSchema>;

export type IAnimal = InferType<typeof AnimalSchema>;

export type IAnimalKey = keyof IAnimal;

type IAnimalCapturePayload = Omit<
  IAnimalCapture,
  'capture_utm_easting' | 'capture_utm_northing' | 'release_utm_easting' | 'release_utm_northing' | 'projection_mode'
>;

type IAnimalMortalityPayload = Omit<IAnimalMortality, 'utm_easting' | 'utm_northing' | 'projection_mode'>;

//Converts IAnimal(Form data) to a Critterbase Critter

export class Critter {
  taxon_id: string;
  taxon_name: string;
  animal_id?: string;
  captures: IAnimalCapturePayload[];
  markings: IAnimalMarking[];
  measurements: {
    qualitative: Omit<IAnimalMeasurement, 'value'>[];
    quantitative: Omit<IAnimalMeasurement, 'option_id'>[];
  };
  mortality: IAnimalMortalityPayload[];
  family: IAnimalRelationship[]; //This type probably needs to change;

  get name(): string {
    return `${this.animal_id}-[${this.taxon_name}]`;
  }

  constructor(animal: IAnimal) {
    this.taxon_id = animal.general.taxon_id;
    this.taxon_name = animal.general.taxon_name;
    this.animal_id = animal.general.animal_id;
    this.captures = animal.captures.map((c) => {
      delete c.projection_mode;
      delete c.capture_utm_northing;
      delete c.capture_utm_easting;
      delete c.release_utm_northing;
      delete c.release_utm_easting;
      return c;
    });
    this.mortality = animal.mortality.map((m) => {
      delete m.mortality_utm_northing;
      delete m.mortality_utm_easting;
      delete m.projection_mode;
      return m;
    });
    this.markings = animal.markings;
    this.family = animal.family;
    this.measurements = {
      qualitative: animal.measurements.filter((m) => {
        if (m.option_id && m.value) {
          console.log('Qualitative measurement must only contain option_id and no value.');
          return false;
        }
        if (m.option_id) {
          delete m.value;
          return true;
        }
        return false;
      }),
      quantitative: animal.measurements.filter((m) => {
        if (m.option_id && m.value) {
          console.log('Quantitative measurement must only contain a value and no option_id');
          return false;
        }
        if (m.value != null) {
          delete m.option_id;
          return true;
        }
        return false;
      })
    };
  }
}
