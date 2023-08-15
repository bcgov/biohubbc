import yup from 'utils/YupSchema';
import { v4 } from 'uuid';
import { InferType, reach } from 'yup';

/**
 * Provides an acceptable amount of type security with formik field names for animal forms
 * Returns formatted field name in regular or array format
 */

export const getAnimalFieldName = <T>(animalKey: keyof IAnimal, fieldKey: keyof T, idx?: number) => {
  return idx === undefined ? `${animalKey}.${String(fieldKey)}` : `${animalKey}.${idx}.${String(fieldKey)}`;
};

export const lastAnimalValueValid = (animalKey: keyof IAnimal, values: IAnimal) => {
  const section = values[animalKey];
  const lastIndex = section.length - 1;
  const lastValue = section[lastIndex];
  if (!lastValue) {
    return true;
  }
  const schema = reach(AnimalSchema, `markings[${lastIndex}]`);
  console.log(schema.describe());
  return schema.isValidSync(lastValue);
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
  release_longitude: lonSchema.optional(),
  release_latitude: latSchema.optional(),
  release_utm_northing: numSchema.optional(),
  release_utm_easting: numSchema.optional(),
  release_coordinate_uncertainty: numSchema.optional(),
  release_timestamp: yup.date().optional(),
  release_comment: yup.string().optional(),
  projection_mode: yup.mixed().oneOf(['wgs', 'utm'])
});

export const AnimalMarkingSchema = yup.object({}).shape({
  marking_type_id: yup.string().required(req),
  taxon_marking_body_location_id: yup.string().required(req),
  primary_colour_id: yup.string().optional(),
  secondary_colour_id: yup.string().optional(),
  marking_comment: yup.string()
});

const AnimalMeasurementSchema = yup.object({}).shape({
  taxon_measurement_id: yup.string().required(req),
  value: numSchema,
  qualitative_option_id: yup.string(),
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
  family_id: yup.string().required(req),
  relationship: yup.mixed().oneOf(['parent', 'child', 'sibling']).required(req)
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
  Omit<IAnimalMortality, 'utm_easting' | 'utm_northing' | 'projection_mode'> & {
    location_id: string;
  };

type ICritterCapture = ICritterID &
  Omit<
    IAnimalCapture,
    'capture_utm_easting' | 'capture_utm_northing' | 'release_utm_easting' | 'release_utm_northing' | 'projection_mode'
  > & { capture_location_id: string; release_location_id: string | undefined };

type ICritterMarking = ICritterID & IAnimalMarking;

type ICritterQualitativeMeasurement = ICritterID & Omit<IAnimalMeasurement, 'value'>;

type ICritterQuantitativeMeasurement = ICritterID & Omit<IAnimalMeasurement, 'qualitative_option_id'>;

export const newFamilyIdPlaceholder = 'New Family';

type ICritterFamilyParent = {
  family_id: string;
  parent_critter_id: string;
};

type ICritterFamilyChild = {
  family_id: string;
  child_critter_id: string;
};

type ICritterFamily = {
  family_id: string;
  family_label: string;
};

//Converts IAnimal(Form data) to a Critterbase Critter

export class Critter {
  critter_id: string;
  taxon_id: string;
  taxon_name: string;
  animal_id?: string;
  captures: ICritterCapture[];
  markings: ICritterMarking[];
  measurements: {
    qualitative: ICritterQualitativeMeasurement[];
    quantitative: ICritterQuantitativeMeasurement[];
  };
  mortalities: ICritterMortality[];
  families: {
    parents: ICritterFamilyParent[];
    children: ICritterFamilyChild[];
    families: ICritterFamily[];
  };
  locations: ICritterLocation[];

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
    this.families = { parents: [], children: [], families: [] };

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
      delete c.projection_mode;
      delete c.capture_utm_northing;
      delete c.capture_utm_easting;
      delete c.release_utm_northing;
      delete c.release_utm_easting;
      this.captures.push({
        ...c,
        critter_id: this.critter_id,
        capture_location_id: c_loc_id,
        release_location_id: r_loc_id
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
      delete m.mortality_utm_northing;
      delete m.mortality_utm_easting;
      delete m.projection_mode;
      this.mortalities.push({ ...m, critter_id: this.critter_id, location_id: loc_id });
    });

    this.markings = animal.markings.map((m) => ({ ...m, critter_id: this.critter_id }));

    let newFamily = undefined;
    for (const f of animal.family) {
      if (f.family_id === newFamilyIdPlaceholder) {
        if (!newFamily) {
          newFamily = { family_id: v4(), family_label: this.name + '_family' };
          this.families.families.push(newFamily)
        }
        f.family_id = newFamily.family_id;
      }
    }

    this.families.parents = animal.family
      .filter((a) => a.relationship === 'parent')
      .map((a) => ({ family_id: a.family_id, parent_critter_id: this.critter_id }));
    this.families.children = animal.family
      .filter((a) => a.relationship === 'child')
      .map((a) => ({ family_id: a.family_id, child_critter_id: this.critter_id }));

    this.measurements = {
      qualitative: animal.measurements
        .filter((m) => {
          if (m.qualitative_option_id && m.value) {
            console.log('Qualitative measurement must only contain option_id and no value.');
            return false;
          }
          if (m.qualitative_option_id) {
            delete m.value;
            return true;
          }
          return false;
        })
        .map((m) => ({ ...m, critter_id: this.critter_id })),
      quantitative: animal.measurements
        .filter((m) => {
          if (m.qualitative_option_id && m.value) {
            console.log('Quantitative measurement must only contain a value and no option_id');
            return false;
          }
          if (m.value != null) {
            delete m.qualitative_option_id;
            return true;
          }
          return false;
        })
        .map((m) => ({ ...m, critter_id: this.critter_id }))
    };
  }
}
