import { DATE_LIMIT } from 'constants/dateTimeFormats';
import { default as dayjs } from 'dayjs';
import {
  ILocationCreate,
  IQualitativeMeasurementCreate,
  IQualitativeMeasurementUpdate,
  IQuantitativeMeasurementCreate,
  IQuantitativeMeasurementUpdate
} from 'interfaces/useCritterApi.interface';
import { PROJECTION_MODE } from 'utils/mapProjectionHelpers';
import yup from 'utils/YupSchema';

/**
 * Critterbase related enums.
 */

export enum ANIMAL_FORM_MODE {
  ADD = 'add',
  EDIT = 'edit'
}

export enum AnimalRelationship {
  CHILD = 'children',
  PARENT = 'parents'
}

const glt = (num: number, greater = true) => `Must be ${greater ? 'greater' : 'less'} than or equal to ${num}`;

const dateSchema = yup
  .date()
  .min(dayjs(DATE_LIMIT.min), `Must be after ${DATE_LIMIT.min}`)
  .max(dayjs(DATE_LIMIT.max), `Must be before ${DATE_LIMIT.max}`)
  .typeError('Invalid date format');

/**
 * Critterbase create schemas.
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
      then: yup.number().min(-90, glt(-90)).max(90, glt(90, false)).typeError('Must be a number')
    })
    .when('projection_mode', {
      is: (projection_mode: PROJECTION_MODE) => projection_mode === PROJECTION_MODE.UTM,
      then: yup.number()
    })
    .required('Required'),
  longitude: yup
    .number()
    .when('projection_mode', {
      is: (projection_mode: PROJECTION_MODE) => projection_mode === PROJECTION_MODE.WGS,
      then: yup.number().min(-180, glt(-180)).max(180, glt(180, false)).typeError('Must be a number')
    })
    .when('projection_mode', {
      is: (projection_mode: PROJECTION_MODE) => projection_mode === PROJECTION_MODE.UTM,
      then: yup.number()
    })
    .required('Required'),
  coordinate_uncertainty: yup.number().required('Required'),
  coordinate_uncertainty_unit: yup.string()
});

export const CreateCritterCaptureSchema = yup.object({
  capture_id: yup.string().optional(),
  critter_id: yup.string().required('Required'),
  capture_location: LocationSchema.required(),
  release_location: LocationSchema.optional().default(undefined),
  capture_comment: yup.string().optional(),
  capture_date: yup.string().required('Required'),
  capture_time: yup.string().optional().nullable(),
  release_date: yup.string().optional().nullable(),
  release_time: yup.string().optional().nullable(),
  release_comment: yup.string().optional()
});

export const CreateBulkCritterCaptureSchema = yup.object({
  capture_id: yup.string().optional(),
  critter_id: yup.string().required('Required'),
  capture_location_id: yup.string().uuid().optional(),
  release_location_id: yup.string().uuid().optional(),
  capture_comment: yup.string().optional(),
  capture_date: yup.string().required('Required'),
  capture_time: yup.string().optional().nullable(),
  release_date: yup.string().optional().nullable(),
  release_time: yup.string().optional().nullable(),
  release_comment: yup.string().optional()
});

export const CreateCritterSchema = yup.object({
  critter_id: yup.string().optional(),
  itis_tsn: yup.number().required('Required'),
  animal_id: yup.string().required('Required'),
  wlh_id: yup.string().optional().nullable(),
  sex_qualitative_option_id: yup.string().uuid().nullable(),
  critter_comment: yup.string().optional().nullable()
});

export const CreateCritterMarkingSchema = yup.object({
  marking_id: yup.string().optional(),
  critter_id: yup.string().required('Required'),
  marking_type_id: yup.string().required('Marking type is required'),
  taxon_marking_body_location_id: yup.string().required('Body location required'),
  primary_colour_id: yup.string().optional().nullable(),
  secondary_colour_id: yup.string().optional().nullable(),
  comment: yup.string().optional().nullable()
});

export const CreateCritterMeasurementSchema = yup.object({
  critter_id: yup.string().required().required('Required'),
  measurement_qualitative_id: yup.string().optional().nullable(),
  measurement_quantitative_id: yup.string().optional().nullable(),
  taxon_measurement_id: yup.string().required('Type is required'),
  qualitative_option_id: yup.string().optional().nullable(),
  value: yup.number().typeError('Must be a number').required('Required').optional().nullable(),
  measured_timestamp: dateSchema.required('Date is required').optional().nullable(),
  measurement_comment: yup.string().optional().nullable(),
  capture_id: yup.string().optional().nullable(),
  mortality_id: yup.string().optional().nullable()
});

export const CreateCritterCollectionUnitSchema = yup.object({
  critter_collection_unit_id: yup.string().optional(),
  critter_id: yup.string().required('Required'),
  collection_unit_id: yup.string().required('Name is required'),
  collection_category_id: yup.string().required('Category is required')
});

export const CreateCritterMortalitySchema = yup.object({
  critter_id: yup.string().required('Required'),
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
  critterbase_critter_id: yup.string().uuid().required(),
  family_id: yup.string().optional(),
  family_label: yup.string().optional(),
  relationship: yup.mixed().oneOf(Object.values(AnimalRelationship)).required('Required')
});

/**
 * Critterbase schema infered types.
 *
 */
export type ICreateCritter = yup.InferType<typeof CreateCritterSchema>;

export type ICreateCritterMarking = yup.InferType<typeof CreateCritterMarkingSchema>;
export type ICreateCritterMeasurement = yup.InferType<typeof CreateCritterMeasurementSchema>;
export type ICreateCritterCollectionUnit = yup.InferType<typeof CreateCritterCollectionUnitSchema> & { key?: string };
export type ICreateCritterCapture = yup.InferType<typeof CreateCritterCaptureSchema>;
export type ICreateBulkCritterCapture = yup.InferType<typeof CreateBulkCritterCaptureSchema>;
export type ICreateCritterFamily = yup.InferType<typeof CreateCritterFamilySchema>;
export type ICreateCritterMortality = yup.InferType<typeof CreateCritterMortalitySchema>;

/**
 * Adding data to a critters in bulk
 */
export type IBulkCreate = {
  critters?: ICreateCritter[];
  qualitative_measurements?: IQualitativeMeasurementCreate[];
  quantitative_measurements?: IQuantitativeMeasurementCreate[];
  locations?: ILocationCreate[];
  captures?: ICreateBulkCritterCapture[];
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
