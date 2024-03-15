export type ICollectionUnitResponse = {
  critter_collection_unit_id: string;
  category_name: string;
  unit_name: string;
  collection_unit_id: string;
  collection_category_id: string;
};

type ILocationResponse = {
  latitude: number;
  longitude: number;
  coordinate_uncertainty: number | null;
  coordinate_uncertainty_unit: string | null;
  temperature: number | null;
  location_comment: string | null;
  region_env_id: string | null;
  region_nr_id: string | null;
  wmu_id: string | null;
};

export type ICaptureResponse = {
  capture_id: string;
  // capture_location_id: string | null; // Deprecated -> Now included in capture_location
  // release_location_id: string | null; // Deprecated -> Now included in release_location
  capture_timestamp: string;
  release_timestamp: string | null;
  capture_comment: string | null;
  release_comment: string | null;
  capture_location: ILocationResponse | null;
  release_location: ILocationResponse | null;
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
  comment: string | null;
  attached_timestamp: string;
  removed_timestamp: string | null;
  body_location: string;
  marking_type: string;
  marking_material: string;
  primary_colour: string | null;
  secondary_colour: string | null;
  text_colour: string | null;
  marking_comment: string | null;
};

export type IQualitativeMeasurementResponse = {
  measurement_qualitative_id: string;
  taxon_measurement_id: string;
  capture_id: string | null;
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

type IMortalityResponse = {
  mortality_id: string;
  location_id: string | null;
  mortality_timestamp: string;
  mortality_location: ILocationResponse;
  proximate_cause_of_death_id: string | null;
  proximate_cause_of_death_confidence: string;
  proximate_predated_by_itis_tsn: string | null;
  ultimate_cause_of_death_id: string | null;
  ultimate_cause_of_death_confidence: string;
  ultimate_predated_by_itis_tsn: string | null;
  mortality_comment: string | null;
};

export type IFamilyParentResponse = {
  family_id: string;
  family_label: string;
  parent_critter_id: string;
};

type IFamilyChildResponse = {
  family_id: string;
  family_label: string;
  child_critter_id: string;
};

export type ICritterDetailedResponse = {
  critter_id: string;
  itis_tsn: number;
  itis_scientific_name: string;
  wlh_id: string | null;
  animal_id: string | null;
  sex: string;
  responsible_region_nr_id: string;
  collection_units: ICollectionUnitResponse[];
  mortality: IMortalityResponse[];
  captures: ICaptureResponse[];
  markings: IMarkingResponse[];
  measurements: {
    qualitative: IQualitativeMeasurementResponse[];
    quantitative: IQuantitativeMeasurementResponse[];
  };
  family_parent: IFamilyParentResponse[];
  family_child: IFamilyChildResponse[];
};

export interface ICritterSimpleResponse {
  critter_id: string;
  wlh_id: string;
  animal_id: string;
  sex: string;
  //   taxon: string; // Deprecated
  itis_tsn: number;
  itis_scientific_name: string;
  //TODO: Remove
  /**
   * These two properties are available in the detailed critter response.
   * Business rules allowed multiple mortality records.
   * mortality_timestamp == mortality[0].mortality_timestamp
   */
  //collection_units: ICollectionUnitResponse[]; // Deprecated - This can come back if needed though
  //mortality_timestamp?: string; // Deprecated - This can comeback if needed through.
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
