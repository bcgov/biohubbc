import { ICreateCritterCollectionUnit } from 'features/surveys/view/survey-animals/animal';
import { Feature } from 'geojson';
import { IPartialTaxonomy } from './useTaxonomyApi.interface';

export type ICritterCreate = {
  critter_id?: string;
  wlh_id?: string | null;
  animal_id?: string | null;
  sex_qualitative_option_id: string | null;
  itis_tsn: number;
  responsible_region_nr_id?: string | null;
  critter_comment?: string | null;
};

export interface ICreateEditAnimalRequest {
  critter_id?: string;
  nickname: string;
  species: IPartialTaxonomy | null;
  sex_qualitative_option_id: string | null;
  ecological_units: ICreateCritterCollectionUnit[];
  wildlife_health_id: string | null;
  critter_comment: string | null;
}

export interface IMarkingPostData {
  /**
   * Internal id used to satisfy react key requirements. Not sent to the API
   */
  _id?: string;

  /**
   * Critterbase primary key for a marking attached to an animal
   */
  marking_id?: string;
  marking_type_id: string;
  taxon_marking_body_location_id: string;
  identifier: string | number | null;
  primary_colour_id: string | null;
  secondary_colour_id: string | null;
  comment: string | null;
}

export interface ICapturePostData {
  capture_id: string;
  capture_method_id: string | null;
  capture_date: string;
  capture_time?: string | null;
  release_date?: string | null;
  release_time?: string | null;
  capture_comment: string | null;
  release_comment: string | null;
  capture_location: Feature | null;
  release_location: Feature | null;
}

export type IMortalityPostData = {
  mortality_id: string;
  mortality_timestamp: string;
  mortality_date?: string;
  mortality_time?: string;
  proximate_cause_of_death_id?: string | null;
  proximate_cause_of_death_confidence?: string | null;
  proximate_predated_by_itis_tsn?: number | null;
  ultimate_cause_of_death_id?: string | null;
  ultimate_cause_of_death_confidence?: string | null;
  ultimate_predated_by_itis_tsn?: number | null;
  mortality_comment: string | null;
  location: Feature | null;
};

export interface ILocationPostData {
  location_id?: number;
  latitude: number;
  longitude: number;
  coordinate_uncertainty: number;
  coordinate_uncertainty_unit: string;
}

export interface IMarkings {
  markings: IMarkingPostData[];
}

export interface IMeasurementsCreate {
  measurements: (IQuantitativeMeasurementCreate | IQualitativeMeasurementCreate)[];
}

export interface IMeasurementsUpdate {
  measurements: (IQuantitativeMeasurementUpdate | IQualitativeMeasurementUpdate)[];
}

export interface ICreateCaptureRequest extends IMarkings, IMeasurementsCreate {
  attachments: {
    capture_attachments: {
      create: Record<string, File>;
      delete?: never;
    };
  };
  capture: ICapturePostData;
}

export interface IEditCaptureRequest extends IMarkings, IMeasurementsUpdate {
  attachments: {
    capture_attachments: {
      create: Record<string, File>;
      delete: number[];
    };
  };
  capture: ICapturePostData;
}

export interface ICreateMortalityRequest extends IMarkings, IMeasurementsCreate {
  mortality: IMortalityPostData;
}

export interface IEditMortalityRequest extends IMarkings, IMeasurementsUpdate {
  mortality: IMortalityPostData;
}

export interface ICollectionUnitMultiTsnResponse {
  tsn: number;
  categories: ICollectionCategory[];
}

interface ICritterAttachmentBase {
  uuid: string;
  critter_id: number;
  file_type: string;
  file_name: string;
  file_size: number;
  title: string | null;
  description: string | null;
  key: string;
}

export type ICritterCaptureAttachment = {
  critter_capture_attachment_id: number;
  critterbase_capture_id: string;
} & ICritterAttachmentBase;

export interface ICollectionCategory {
  collection_category_id: string;
  category_name: string;
  description: string | null;
  itis_tsn: number;
}

export interface ICollectionUnit {
  collection_unit_id: string;
  collection_category_id: string;
  unit_name: string;
  description: string | null;
}

export interface ICreateUpdateCritterCollectionUnitResponse {
  critter_collection_unit_id: string;
  critter_id: string;
  collection_unit_id: string;
  unit_name: string | null;
  unit_description: string | null;
}

export interface ICritterCollectionUnitResponse {
  critter_collection_unit_id: string;
  collection_category_id: string;
  collection_unit_id: string;
  unit_name: string;
  category_name: string;
}

type ILocationResponse = {
  location_id: string;
  latitude: number | null;
  longitude: number | null;
  coordinate_uncertainty: number | null;
  coordinate_uncertainty_unit: string | null;
  temperature: number | null;
  location_comment: string | null;
  region_env_id: string | null;
  region_nr_id: string | null;
  wmu_id: string | null;
};

export type ILocationCreate = {
  location_id?: string;
  latitude: number;
  longitude: number;
  coordinate_uncertainty?: number | null;
  coordinate_uncertainty_unit?: string;
  temperature?: number | null;
  location_comment?: string | null;
  region_env_id?: string | null;
  region_nr_id?: string | null;
  wmu_id?: string | null;
};

export type ICaptureResponse = {
  capture_id: string;
  capture_date: string;
  capture_method_id: string | null;
  capture_time: string | null;
  release_date: string | null;
  release_time: string | null;
  capture_comment: string | null;
  release_comment: string | null;
  capture_location?: ILocationResponse | null;
  release_location?: ILocationResponse | null;
};

export type IMarkingResponse = {
  marking_id: string;
  capture_id: string;
  mortality_id: string | null;
  taxon_marking_body_location_id: string;
  primary_colour_id: string | null;
  secondary_colour_id: string | null;
  marking_type_id: string;
  marking_material_id: string;
  identifier: string;
  frequency: string | null;
  frequency_unit: string | null;
  order: string | null;
  attached_timestamp: string;
  removed_timestamp: string | null;
  body_location: string;
  marking_type: string;
  marking_material: string;
  primary_colour: string | null;
  secondary_colour: string | null;
  text_colour: string | null;
  comment: string | null;
};

export type IQualitativeMeasurementCreate = {
  taxon_measurement_id: string;
  capture_id?: string | null;
  mortality_id?: string | null;
  qualitative_option_id: string;
  measurement_comment?: string | null;
  measured_timestamp?: string | null;
};

export type IQuantitativeMeasurementCreate = {
  taxon_measurement_id: string;
  capture_id?: string | null;
  mortality_id?: string | null;
  value: number;
  measurement_comment?: string | null;
  measured_timestamp?: string | null;
};

export type ICritterUpdate = ICritterCreate & {
  critter_id: string;
};

export type IQualitativeMeasurementUpdate = IQualitativeMeasurementCreate & {
  measurement_qualitative_id: string;
};

export type IQuantitativeMeasurementUpdate = IQuantitativeMeasurementCreate & {
  measurement_quantitative_id: string;
};

export type IQualitativeMeasurementResponse = {
  measurement_qualitative_id: string;
  taxon_measurement_id: string;
  capture_id?: string | null;
  mortality_id: string | null;
  qualitative_option_id: string;
  measurement_comment: string | null;
  measured_timestamp: string | null;
  measurement_name: string;
  value: string;
};

export type IQuantitativeMeasurementResponse = {
  measurement_quantitative_id: string;
  taxon_measurement_id: string;
  capture_id: string | null;
  mortality_id: string | null;
  value: number;
  measurement_comment: string | null;
  measured_timestamp: string | null;
  measurement_name: string;
};

export type ICauseOfDeathOption = {
  key: string;
  id: string;
  value: string;
};

export type IMortalityResponse = {
  mortality_id: string;
  location_id: string | null;
  mortality_timestamp: string;
  location: ILocationResponse | null;
  proximate_cause_of_death_id: string | null;
  proximate_cause_of_death_confidence: string;
  proximate_predated_by_itis_tsn: number | null;
  ultimate_cause_of_death_id: string | null;
  ultimate_cause_of_death_confidence: string;
  ultimate_predated_by_itis_tsn: number | null;
  mortality_comment: string | null;
};

export type IFamilyParentResponse = {
  family_id: string;
  family_label: string;
  parent_critter_id: string;
};

export type IFamilyChildResponse = {
  family_id: string;
  family_label: string;
  child_critter_id: string;
};

export interface ISex {
  qualitative_option_id: string;
  label: string;
}

export type ICritterDetailedResponse = {
  critter_id: number;
  critterbase_critter_id: string;
  itis_tsn: number;
  itis_scientific_name: string;
  wlh_id: string | null;
  animal_id: string | null;
  sex: ISex | null;
  responsible_region_nr_id: string;
  critter_comment: string | null;
  collection_units: ICritterCollectionUnitResponse[];
  mortality: IMortalityResponse[];
  captures: ICaptureResponse[];
  markings: IMarkingResponse[];
  measurements: {
    qualitative: IQualitativeMeasurementResponse[];
    quantitative: IQuantitativeMeasurementResponse[];
  };
  family_parent: IFamilyParentResponse[];
  family_child: IFamilyChildResponse[];
  attachments: {
    capture_attachments: ICritterCaptureAttachment[];
  };
};

export interface ICritterSimpleResponse {
  critter_id: number;
  critterbase_critter_id: string;
  wlh_id: string | null;
  animal_id: string | null;
  sex: ISex;
  itis_tsn: number;
  itis_scientific_name: string;
  responsible_region_nr_id: string | null;
  critter_comment: string | null;
}

/**
 * A Critterbase quantitative measurement.
 */
export type CBQuantitativeMeasurement = {
  event_id: string;
  measurement_quantitative_id: string;
  taxon_measurement_id: string;
  value: number;
  measurement_comment: string;
  measured_timestamp: string;
};

/**
 * A Critterbase qualitative measurement value.
 */
export type CBQualitativeMeasurement = {
  event_id: string;
  measurement_qualitative_id: string;
  taxon_measurement_id: string;
  qualitative_option_id: string;
  measurement_comment: string;
  measured_timestamp: string;
};

/**
 * Any Critterbase measurement value.
 */
export type CBMeasurementValue = CBQuantitativeMeasurement | CBQualitativeMeasurement;

/**
 * A Critterbase qualitative measurement unit.
 */
export type CBMeasurementUnit = 'millimeter' | 'centimeter' | 'meter' | 'milligram' | 'gram' | 'kilogram';

/**
 * A Critterbase quantitative measurement type definition.
 */
export type CBQuantitativeMeasurementTypeDefinition = {
  itis_tsn: number | null;
  taxon_measurement_id: string;
  measurement_name: string;
  measurement_desc: string | null;
  min_value: number | null;
  max_value: number | null;
  unit: CBMeasurementUnit | null;
};

/**
 * A Critterbase qualitative measurement option definition (ie. drop-down option).
 */
export type CBQualitativeOption = {
  taxon_measurement_id: string;
  qualitative_option_id: string;
  option_label: string;
  option_value: number;
  option_desc: string | null;
};

/**
 * A Critterbase qualitative measurement type definition.
 */
export type CBQualitativeMeasurementTypeDefinition = {
  itis_tsn: number | null;
  taxon_measurement_id: string;
  measurement_name: string;
  measurement_desc: string | null;
  options: CBQualitativeOption[];
};

/**
 * Any Critterbase measurement type definition.
 */
export type CBMeasurementType = CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition;

/**
 * Response object when searching for measurement type definitions by itis tsn.
 */
export type CBMeasurementSearchByTsnResponse = {
  qualitative: CBQualitativeMeasurementTypeDefinition[];
  quantitative: CBQuantitativeMeasurementTypeDefinition[];
};

/**
 * Response object when searching for measurement type definitions by search term.
 */
export type CBMeasurementSearchByTermResponse = {
  qualitative: CBQualitativeMeasurementTypeDefinition[];
  quantitative: CBQuantitativeMeasurementTypeDefinition[];
};
