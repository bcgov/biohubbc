import { DATE_LIMIT } from 'constants/dateTimeFormats';
import { default as dayjs } from 'dayjs';
import {
  ICritterDetailedResponse,
  IQualitativeMeasurementCreate,
  IQualitativeMeasurementUpdate,
  IQuantitativeMeasurementCreate,
  IQuantitativeMeasurementUpdate
} from 'interfaces/useCritterApi.interface';
import { PROJECTION_MODE } from 'utils/mapProjectionHelpers';
import yup from 'utils/YupSchema';
import { AnyObjectSchema, InferType } from 'yup';

/**
 * Critterbase related enums.
 *
 */
export enum ANIMAL_FORM_MODE {
  ADD = 'add',
  EDIT = 'edit'
}

export enum AnimalSex {
  MALE = 'Male',
  FEMALE = 'Female',
  UNKNOWN = 'Unknown',
  HERM = 'Hermaphroditic'
}

export enum AnimalRelationship {
  CHILD = 'children',
  PARENT = 'parents'
}

export enum ANIMAL_SECTION {
  GENERAL = 'General',
  COLLECTION_UNITS = 'Ecological Units',
  MARKINGS = 'Markings',
  MEASUREMENTS = 'Measurements',
  CAPTURES = 'Captures',
  MORTALITY = 'Mortality',
  FAMILY = 'Family'
}

/**
 * Shared props for animal section forms.
 * example: MarkingAnimalForm
 *
 */

export type AnimalFormProps<T> =
  | {
      /**
       * When formMode 'ADD' formObject is undefined.
       */
      formObject?: never;
      /**
       * The form mode -> Add / EDIT.
       */
      formMode: ANIMAL_FORM_MODE.ADD;
      /**
       * The dialog open state.
       */
      open: boolean;
      /**
       * Callback when dialog closes.
       */
      handleClose: () => void;
      /**
       * Critterbase detailed critter object.
       */
      critter: ICritterDetailedResponse;
    }
  | {
      /**
       * When formMode 'EDIT' formObject is defined.
       */
      formObject: T;
      formMode: ANIMAL_FORM_MODE.EDIT;
      open: boolean;
      handleClose: () => void;
      critter: ICritterDetailedResponse;
    };

/**
 * Checks if property in schema is required. Used to keep required fields in sync with schema.
 * ie: { required: true } -> { required: isReq(Schema, 'property_name') }
 *
 * @template T - AnyObjectSchema
 * @param {T} schema - Yup Schema.
 * @param {keyof T['fields']} key - Property of yup schema.
 * @returns {boolean} indicator if required in schema.
 */
export const isRequiredInSchema = <T extends AnyObjectSchema>(schema: T, key: keyof T['fields']): boolean => {
  return Boolean(schema.fields[key].exclusiveTests.required);
};

export const glt = (num: number, greater = true) => `Must be ${greater ? 'greater' : 'less'} than or equal to ${num}`;

const req = 'Required';
const mustBeNum = 'Must be a number';
const numSchema = yup.number().typeError(mustBeNum);

const latSchema = yup.number().min(-90, glt(-90)).max(90, glt(90, false)).typeError(mustBeNum);
const lonSchema = yup.number().min(-180, glt(-180)).max(180, glt(180, false)).typeError(mustBeNum);

const dateSchema = yup
  .date()
  .min(dayjs(DATE_LIMIT.min), `Must be after ${DATE_LIMIT.min}`)
  .max(dayjs(DATE_LIMIT.max), `Must be before ${DATE_LIMIT.max}`)
  .typeError('Invalid date format');

/**
 * Critterbase create schemas.
 *
 */

export const LocationSchema = yup.object().shape({
  /**
   * This is useful for when you need to have different validation for the projection mode.
   * example: easting/northing or lat/lng fields have different min max values.
   */
  projection_mode: yup.mixed<PROJECTION_MODE>().oneOf(Object.values(PROJECTION_MODE)).default(PROJECTION_MODE.WGS),

  location_id: yup.string().optional(),
  latitude: yup
    .number()
    .when('projection_mode', {
      is: (projection_mode: PROJECTION_MODE) => projection_mode === PROJECTION_MODE.WGS,
      then: latSchema
    })
    .when('projection_mode', {
      is: (projection_mode: PROJECTION_MODE) => projection_mode === PROJECTION_MODE.UTM,
      then: yup.number()
    })
    .required(req),
  longitude: yup
    .number()
    .when('projection_mode', {
      is: (projection_mode: PROJECTION_MODE) => projection_mode === PROJECTION_MODE.WGS,
      then: lonSchema
    })
    .when('projection_mode', {
      is: (projection_mode: PROJECTION_MODE) => projection_mode === PROJECTION_MODE.UTM,
      then: yup.number()
    })
    .required(req),
  coordinate_uncertainty: yup.number().required(req),
  coordinate_uncertainty_unit: yup.string()
});

export const CreateCritterCaptureSchema = yup.object({
  capture_id: yup.string().optional(),
  critter_id: yup.string().required(req),
  capture_location: LocationSchema.required(),
  release_location: LocationSchema.optional().default(undefined),
  capture_comment: yup.string().optional(),
  capture_date: yup.string().required(req),
  capture_time: yup.string().optional().nullable(),
  release_date: yup.string().optional().nullable(),
  release_time: yup.string().optional().nullable(),
  release_comment: yup.string().optional()
});

export const CreateCritterSchema = yup.object({
  critter_id: yup.string().optional(),
  itis_tsn: yup.number().required(req),
  animal_id: yup.string().required(req),
  wlh_id: yup.string().optional().nullable(),
  sex: yup.mixed<AnimalSex>().oneOf(Object.values(AnimalSex)).required(req),
  critter_comment: yup.string().optional().nullable()
});

export const CreateCritterMarkingSchema = yup.object({
  marking_id: yup.string().optional(),
  critter_id: yup.string().required(req),
  marking_type_id: yup.string().required('Marking type is required'),
  taxon_marking_body_location_id: yup.string().required('Body location required'),
  primary_colour_id: yup.string().optional().nullable(),
  secondary_colour_id: yup.string().optional().nullable(),
  comment: yup.string().optional().nullable()
});

export const CreateCritterMeasurementSchema = yup.object({
  critter_id: yup.string().required().required(req),
  measurement_qualitative_id: yup.string().optional().nullable(),
  measurement_quantitative_id: yup.string().optional().nullable(),
  taxon_measurement_id: yup.string().required('Type is required'),
  qualitative_option_id: yup.string().optional().nullable(),
  value: numSchema.required(req).optional().nullable(),
  measured_timestamp: dateSchema.required('Date is required').optional().nullable(),
  measurement_comment: yup.string().optional().nullable(),
  capture_id: yup.string().optional().nullable(),
  mortality_id: yup.string().optional().nullable()
});

export const CreateCritterCollectionUnitSchema = yup.object({
  critter_collection_unit_id: yup.string().optional(),
  critter_id: yup.string().required(req),
  collection_unit_id: yup.string().required('Name is required'),
  collection_category_id: yup.string().required('Category is required')
});

export const CreateCritterMortalitySchema = yup.object({
  critter_id: yup.string().required(req),
  mortality_id: yup.string().optional().nullable(),
  location: LocationSchema.required(),
  mortality_timestamp: dateSchema.required('Mortality Date is required'),
  mortality_comment: yup.string().optional().nullable(),
  proximate_cause_of_death_id: yup.string().uuid().optional().nullable(),
  proximate_cause_of_death_confidence: yup.string().optional().nullable(),
  proximate_predated_by_itis_tsn: yup.number().optional().nullable(),
  ultimate_cause_of_death_id: yup.string().uuid().optional().nullable(),
  ultimate_cause_of_death_confidence: yup.string().optional().nullable(),
  ultimate_predated_by_itis_tsn: yup.number().optional().nullable()
});

export const CreateCritterFamilySchema = yup.object({
  critter_id: yup.string().uuid().required(),
  family_id: yup.string().optional(),
  family_label: yup.string().optional(),
  relationship: yup.mixed().oneOf(Object.values(AnimalRelationship)).required(req)
});

/**
 * Critterbase schema infered types.
 *
 */
export type ICreateCritter = InferType<typeof CreateCritterSchema>;

export type ICreateCritterMarking = InferType<typeof CreateCritterMarkingSchema>;
export type ICreateCritterMeasurement = InferType<typeof CreateCritterMeasurementSchema>;
export type ICreateCritterCollectionUnit = InferType<typeof CreateCritterCollectionUnitSchema> & { key?: string };
export type ICreateCritterCapture = InferType<typeof CreateCritterCaptureSchema>;
export type ICreateCritterFamily = InferType<typeof CreateCritterFamilySchema>;
export type ICreateCritterMortality = InferType<typeof CreateCritterMortalitySchema>;

/**
 * Adding data to a critters in bulk
 */
export type IBulkCreate = {
  critters?: ICreateCritter[];
  qualitative_measurements?: IQualitativeMeasurementCreate[];
  quantitative_measurements?: IQuantitativeMeasurementCreate[];
  captures?: ICreateCritterCapture[];
  mortality?: ICreateCritterMortality;
  markings?: ICreateCritterMarking[];
  collections?: ICreateCritterCollectionUnit[];
};

/**
 * Editing data for a critters in bulk
 */
export type IBulkUpdate = {
  critters?: ICreateCritter[];
  qualitative_measurements?: IQualitativeMeasurementUpdate[];
  quantitative_measurements?: IQuantitativeMeasurementUpdate[];
  captures?: ICreateCritterCapture[];
  mortalities?: ICreateCritterMortality[];
  markings?: ICreateCritterMarking[];
  collections?: ICreateCritterCollectionUnit[];
};
