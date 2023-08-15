import yup from 'utils/YupSchema';
import { v4 } from 'uuid';
import { AnyObjectSchema, InferType, reach } from 'yup';

/**
 * Provides an acceptable amount of type security with formik field names for animal forms
 * Returns formatted field name in regular or array format
 */
export const getAnimalFieldName = <T>(animalKey: keyof IAnimal, fieldKey: keyof T, idx?: number) => {
  return idx === undefined ? `${animalKey}.${String(fieldKey)}` : `${animalKey}.${idx}.${String(fieldKey)}`;
};

/**
 * Checks if last added value in animal form is valid.
 * Used to disable add btn.
 * ie: Added measurement, checks the measurement has no errors.
 */
export const lastAnimalValueValid = (animalKey: keyof IAnimal, values: IAnimal) => {
  const section = values[animalKey];
  const lastIndex = section.length - 1;
  const lastValue = section[lastIndex];
  if (!lastValue) {
    return true;
  }
  const schema = reach(AnimalSchema, `${animalKey}[${lastIndex}]`);
  return schema.isValidSync(lastValue);
};

/**
 * Checks if property in schema is required. Used to keep required fields in sync with schema.
 * ie: { required: true } -> { required: isReq(Schema, 'property_name') }
 */
export const isReq = <T extends AnyObjectSchema>(schema: T, key: keyof T['fields']) => {
  return schema.fields[key].exclusiveTests.required;
};

const glt = (num: number, greater = true) => `Must be ${greater ? 'greater' : 'less'} than or equal to ${num}`;

const req = 'Required';
const mustBeNum = 'Must be a number';
const numSchema = yup.number().typeError(mustBeNum);
const latSchema = yup.number().min(-90, glt(-90)).max(90, glt(90, false)).typeError(mustBeNum);
const lonSchema = yup.number().min(-180, glt(-180)).max(180, glt(180, false)).typeError(mustBeNum);

export const AnimalGeneralSchema = yup.object({}).shape({
  taxon_id: yup.string().required(req),
  animal_id: yup.string().required(req),
  taxon_name: yup.string()
});

export const AnimalCaptureSchema = yup.object({}).shape({
  capture_longitude: lonSchema.required(req),
  capture_latitude: latSchema.required(req),
  capture_utm_northing: numSchema,
  capture_utm_easting: numSchema,
  capture_timestamp: yup.date().required(req),
  capture_coordinate_uncertainty: numSchema,
  capture_comment: yup.string(),
  projection_mode: yup.mixed().oneOf(['wgs', 'utm']),
  release_longitude: lonSchema.optional(),
  release_latitude: latSchema.optional(),
  release_utm_northing: numSchema.optional(),
  release_utm_easting: numSchema.optional(),
  release_coordinate_uncertainty: numSchema.optional(),
  release_timestamp: yup.date().optional(),
  release_comment: yup.string().optional()
});

export const AnimalMarkingSchema = yup.object({}).shape({
  marking_type_id: yup.string().required(req),
  taxon_marking_body_location_id: yup.string().required(req),
  primary_colour_id: yup.string().optional(),
  secondary_colour_id: yup.string().optional(),
  marking_comment: yup.string()
});

export const AnimalMeasurementSchema = yup.object({}).shape({
  taxon_measurement_id: yup.string().required(req),
  value: numSchema,
  qualitative_option_id: yup.string(),
  measured_timestamp: yup.date().required(req),
  measurement_comment: yup.string()
});

export const AnimalMortalitySchema = yup.object({}).shape({
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

export const AnimalRelationshipSchema = yup.object({}).shape({
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
  general: AnimalGeneralSchema,
  captures: yup.array().of(AnimalCaptureSchema).required(),
  markings: yup.array().of(AnimalMarkingSchema).required(),
  measurements: yup.array().of(AnimalMeasurementSchema).required(),
  mortality: yup.array().of(AnimalMortalitySchema).required(),
  family: yup.array().of(AnimalRelationshipSchema).required(),
  images: yup.array().of(AnimalImageSchema).required(),
  device: AnimalTelemetryDeviceSchema.default(undefined)
});

export const LocationSchema = yup.object({}).shape({
  location_id: yup.string(),
  latitude: yup.number(),
  longitude: yup.number(),
  coordinate_uncertainty: yup.number(),
  coordinate_uncertainty_unit: yup.string()
});

//Animal form related types

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

//Critterbase related types
type ICritterID = { critter_id: string };

type ICritterLocation = InferType<typeof LocationSchema>;

type ICritterMortality = ICritterID &
  Omit<
    IAnimalMortality,
    | 'mortality_utm_easting'
    | 'mortality_utm_northing'
    | 'projection_mode'
    | 'mortality_latitude'
    | 'mortality_longitude'
    | 'mortality_coordinate_uncertainty'
  > & {
    location_id: string;
  };

type ICritterCapture = ICritterID &
  Pick<IAnimalCapture, 'capture_timestamp' | 'release_timestamp' | 'release_comment' | 'capture_comment'> & {
    capture_location_id: string;
    release_location_id: string | undefined;
  };

type ICritterMarking = ICritterID & IAnimalMarking;

type ICritterQualitativeMeasurement = ICritterID & Omit<IAnimalMeasurement, 'value'>;

type ICritterQuantitativeMeasurement = ICritterID & Omit<IAnimalMeasurement, 'qualitative_option_id'>;

//Converts IAnimal(Form data) to a Critterbase Critter

export class Critter {
  critter_id: string;
  taxon_id: string;
  animal_id: string;
  captures: ICritterCapture[];
  markings: ICritterMarking[];
  measurements: {
    qualitative: ICritterQualitativeMeasurement[];
    quantitative: ICritterQuantitativeMeasurement[];
  };
  mortalities: ICritterMortality[];
  family: IAnimalRelationship[]; //This type probably needs to change;
  locations: ICritterLocation[];

  private taxon_name?: string;

  get name(): string {
    return `${this.animal_id}-[${this.taxon_name}]`;
  }

  constructor(animal: IAnimal) {
    this.critter_id = v4();
    this.taxon_id = animal.general.taxon_id;
    this.taxon_name = animal.general.taxon_name;
    this.animal_id = animal.general.animal_id;

    this.captures = [];
    this.locations = [];
    animal.captures.forEach((c) => {
      const c_loc_id = v4();
      let r_loc_id: string | undefined = undefined;

      this.locations.push({
        location_id: c_loc_id,
        latitude: Number(c.capture_latitude),
        longitude: Number(c.capture_longitude),
        coordinate_uncertainty: Number(c.capture_coordinate_uncertainty),
        coordinate_uncertainty_unit: 'm'
      });

      if (c.release_latitude && c.release_longitude) {
        r_loc_id = v4();

        this.locations.push({
          location_id: r_loc_id,
          latitude: Number(c.release_latitude),
          longitude: Number(c.release_longitude),
          coordinate_uncertainty: Number(c.release_coordinate_uncertainty),
          coordinate_uncertainty_unit: 'm'
        });
      }

      this.captures.push({
        critter_id: this.critter_id,
        capture_location_id: c_loc_id,
        release_location_id: r_loc_id,
        capture_timestamp: c.capture_timestamp,
        release_timestamp: c.release_timestamp,
        capture_comment: c.capture_comment || undefined,
        release_comment: c.release_comment || undefined
      });
    });

    this.mortalities = [];
    animal.mortality.forEach((m) => {
      const loc_id = v4();

      this.locations.push({
        location_id: loc_id,
        latitude: Number(m.mortality_latitude),
        longitude: Number(m.mortality_latitude),
        coordinate_uncertainty: Number(m.mortality_latitude),
        coordinate_uncertainty_unit: 'm'
      });

      const { mortality_longitude, mortality_latitude, mortality_utm_easting, mortality_utm_northing, ...rest } = m;
      this.mortalities.push({
        ...rest,
        critter_id: this.critter_id,
        location_id: loc_id,
        mortality_comment: m.mortality_comment || undefined
      });
    });

    this.markings = animal.markings.map((m) => ({ ...m, critter_id: this.critter_id }));

    this.family = animal.family.map((f) => ({ ...f, critter_id: this.critter_id }));

    this.measurements = {
      qualitative: animal.measurements
        .filter((m) => {
          if (m.qualitative_option_id && m.value) {
            console.log('Qualitative measurement must only contain option_id and no value.');
            return false;
          }
          if (m.qualitative_option_id) {
            return true;
          }
          return false;
        })
        .map((m) => {
          const { value, ...rest } = m;
          return { ...rest, critter_id: this.critter_id };
        }),
      quantitative: animal.measurements
        .filter((m) => {
          if (m.qualitative_option_id && m.value) {
            console.log('Quantitative measurement must only contain a value and no option_id');
            return false;
          }
          if (m.value != null) {
            return true;
          }
          return false;
        })
        .map((m) => {
          const { qualitative_option_id, ...rest } = m;
          return { ...rest, critter_id: this.critter_id };
        })
    };
  }
}
