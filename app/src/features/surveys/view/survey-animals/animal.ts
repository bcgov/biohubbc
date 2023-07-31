import yup from 'utils/YupSchema';
import { InferType } from 'yup';

/**
 * Provides an acceptable amount of type security with formik field names for animal forms
 * Returns formatted field name in regular or array format
 */

export const getAnimalFieldName = <T>(animalKey: keyof IAnimal, fieldKey: keyof T, idx?: number) => {
  return idx === undefined ? `${animalKey}.${fieldKey}` : `${animalKey}.${idx}.${fieldKey}`;
};

const req = 'Required';
const mustBeNum = 'Must be a number';
const glt = (num: number, greater = true) => `Must be ${greater ? 'greater' : 'less'} than or equal to ${num}`;

const latSchema = yup.number().min(-90, glt(-90)).max(90, glt(90, false)).typeError(mustBeNum);
const lonSchema = yup.number().min(-180, glt(-180)).max(180, glt(180, false)).typeError(mustBeNum);

const AnimalGeneralSchema = yup.object({}).shape({
  taxon_id: yup.string().required(req),
  animal_id: yup.string() //nickname
});

const AnimalCaptureSchema = yup.object({}).shape({
  capture_longitude: lonSchema.required(req),
  capture_latitude: latSchema.required(req),
  capture_timestamp: yup.date().required(req),
  capture_comment: yup.string(),
  release_longitude: lonSchema,
  release_latitude: latSchema,
  release_timestamp: yup.date(),
  release_comment: yup.string()
});

export const AnimalMarkingSchema = yup.object({}).shape({
  marking_type_id: yup.string().required(req),
  marking_body_location_id: yup.string().required(req),
  primary_colour_id: yup.string(),
  secondary_colour_id: yup.string(),
  marking_comment: yup.string()
});

const AnimalMeasurementSchema = yup.object({}).shape({});

const AnimalMortalitySchema = yup.object({}).shape({});

const AnimalRelationshipSchema = yup.object({}).shape({});

const AnimalTelemetryDeviceSchema = yup.object({}).shape({
  device_id: yup.string().required(req),
  manufacturer: yup.string().required(req),
  //I think this needs an additional field for hz
  device_frequency: yup.number().required(req),
  model: yup.string().required(req)
});

const AnimalImageSchema = yup.object({}).shape({});

export type IAnimalGeneral = InferType<typeof AnimalGeneralSchema>;

export type IAnimalCapture = InferType<typeof AnimalCaptureSchema>;

export type IAnimalMarking = InferType<typeof AnimalMarkingSchema>;

export type IAnimalMeasurement = InferType<typeof AnimalMeasurementSchema>;

export type IAnimalMortality = InferType<typeof AnimalMortalitySchema>;

export type IAnimalRelationship = InferType<typeof AnimalRelationshipSchema>;

export type IAnimalTelemetryDevice = InferType<typeof AnimalTelemetryDeviceSchema>;

export type IAnimalImage = InferType<typeof AnimalImageSchema>;

export const AnimalSchema = yup.object({}).shape({
  general: AnimalGeneralSchema.required(),
  capture: yup.array().of(AnimalCaptureSchema).required(),
  marking: yup.array().of(AnimalMarkingSchema).required(),
  measurement: yup.array().of(AnimalMeasurementSchema),
  mortality: AnimalMortalitySchema,
  family: yup.array().of(AnimalRelationshipSchema).required(),
  image: yup.array().of(AnimalImageSchema).required(),
  device: AnimalTelemetryDeviceSchema
});

export type IAnimal = InferType<typeof AnimalSchema>;

export type IAnimalAttribute = IAnimal[IAnimalKey];

export type IAnimalKey = keyof IAnimal;
