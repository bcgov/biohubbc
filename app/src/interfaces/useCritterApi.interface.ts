type ICollectionUnitResponse = {
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
  temperature: number | null;
  location_comment: string | null;
  region_env_id: string | null;
  region_nr_id: string | null;
  wmu_id: string | null;
  region_env_name: string | null;
  region_nr_name: string | null;
  wmu_name: string | null;
};

type ICaptureResponse = {
  capture_id: string;
  capture_location_id: string | null;
  release_location_id: string | null;
  capture_timestamp: string;
  release_timestamp: string | null;
  capture_comment: string | null;
  release_comment: string | null;
  capture_location: ILocationResponse | null;
  release_location: ILocationResponse | null;
};

type IMarkingResponse = {
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
};

type IQualitativeMeasurementResponse = {
  measurement_qualitative_id: string;
  taxon_measurement_id: string;
  capture_id: string | null;
  mortality_id: string | null;
  qualitative_option_id: string;
  measurement_comment: string | null;
  measured_timestamp: string | null;
  measurement_name: string;
  option_label: string;
  option_value: number;
};

type IQuantitativeMeasurementResponse = {
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
  location: ILocationResponse;
  proximate_cause_of_death_id: string | null;
  proximate_cause_of_death_confidence: string;
  proximate_predated_by_taxon_id: string | null;
  ultimate_cause_of_death_id: string | null;
  ultimate_cause_of_death_confidence: string;
  ultimate_predated_by_taxon_id: string | null;
  mortality_comment: string | null;
};

type IFamilyParentResponse = {
  family_id: string;
  parent_critter_id: string;
};

type IFamilyChildResponse = {
  family_id: string;
  child_critter_id: string;
};

export type ICritterDetailedResponse = {
  critter_id: string;
  taxon_id: string;
  wlh_id: string | null;
  animal_id: string | null;
  sex: string;
  responsible_region_nr_id: string;
  create_user: string;
  update_user: string;
  create_timestamp: string;
  update_timestamp: string;
  critter_comment: string;
  taxon: string;
  responsible_region: string;
  mortality_timestamp: string | null;
  collection_units: ICollectionUnitResponse[];
  mortality: IMortalityResponse[];
  capture: ICaptureResponse[];
  marking: IMarkingResponse[];
  measurement: {
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
  taxon: string;
  collection_units: ICollectionUnitResponse[];
  mortality_timestamp?: string;
}
