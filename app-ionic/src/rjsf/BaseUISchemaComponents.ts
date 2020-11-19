/**
 * This file should only contain UI Schema items that have NO nested elements.
 *
 * Example of schema item without nested element:
 *
 * const Obj = {
 *   some_field: {}
 * }
 */

const Observation = {
  observation_date: {
    'ui:widget': 'date'
  },
  observation_time: {},
  observation_type: {},
  observer_first_name: {},
  observer_last_name: {},
  reported_area: {},
  sample_taken: {
    'ui:widget': 'radio'
  },
  sample_number: {},
  negative_obs_ind: {
    'ui:widget': 'radio'
  }
};

const Observation_PlantTerrestial = {
  species_density_code: {},
  species_distribution_code: {},
  soil_texture_code: {},
  specific_use_code: {},
  slope_code: {},
  aspect_code: {},
  proposed_action_code: {},
  flowering: {
    'ui:widget': 'radio'
  },
  plant_life_stage: {},
  plant_health: {},
  plant_seed_stage: {},
  sample_identifier: {},
  range_unit_number: {},
  legacy_site_ind: {
    'ui:widget': 'radio'
  },
  early_detection_rapid_resp_ind: {
    'ui:widget': 'radio'
  },
  research_detection_ind: {
    'ui:widget': 'radio'
  },
  well_ind: {
    'ui:widget': 'radio'
  },
  special_care_ind: {
    'ui:widget': 'radio'
  },
  biological_ind: {
    'ui:widget': 'radio'
  }
};

const Observation_PlantAquatic = {
  specific_use_code: {},
  proposed_action_code: {},
  flowering: {},
  plant_life_stage: {},
  plant_health: {},
  plant_seed_stage: {},
  sample_identifier: {},
  range_unit_number: {},
  legacy_site_ind: {
    'ui:widget': 'radio'
  },
  early_detection_rapid_resp_ind: {
    'ui:widget': 'radio'
  },
  research_detection_ind: {
    'ui:widget': 'radio'
  },
  sample_taken: {
    'ui:widget': 'radio'
  },
  sample_point_number: {},
  special_care_ind: {
    'ui:widget': 'radio'
  },
  biological_ind: {
    'ui:widget': 'radio'
  },
  secchi_depth: {},
  water_depth: {},
  voucher_submitted_ind: {
    'ui:widget': 'radio'
  },
  voucher_submission_detail: {}
};

const Observation_AnimalTerrestrial = {
  number_of_individuals_observed: {},
  life_stage_code: {},
  behaviour_code: {}
};

const Observation_AnimalAquatic = {
  observation_details: {}
};

const Treatment = {};

const Treatment_MechanicalPlant = {
  applicator1_first_name: {},
  applicator1_last_name: {},
  applicator2_first_name: {},
  applicator2_last_name: {},
  treatment_contractor: {},
  mechanical_method_code: {},
  mechanical_disposal_method_code: {},
  mechanical_root_removal_code: {},
  mechanical_soil_disturbance_code: {},
  signage_on_site: {
    'ui:widget': 'radio'
  }
};

const Treatment_BiologicalPlant = {
  applicator1_first_name: {},
  applicator1_last_name: {},
  applicator2_first_name: {},
  applicator2_last_name: {},
  treatment_contractor: {},
  classified_area: {},
  release_quantity: {},
  agent_source: {},
  biological_agent: {},
  biological_agent_stage: {},
  bioagent_maturity_status: {}
};

const Treatment_BiologicalDispersalPlant = {
  applicator1_first_name: {},
  applicator1_last_name: {},
  applicator2_first_name: {},
  applicator2_last_name: {},
  treatment_contractor: {},
  duration_of_count: {},
  biological_agent: {},
  plant_count: {},
  biological_agent_count: {},
  biological_agent_presence: {}
};

const Treatment_MechanicalTerrestrialAnimal = {
  treatment_details: {}
};

const Treatment_ChemicalTerrestrialAnimal = {
  treatment_details: {}
};

const Treatment_BiologicalTerrestrialAnimal = {
  treatment_details: {}
};

const Monitoring = {
  activity_id: {},
  observer_first_name: {},
  observer_last_name: {},
  efficacy_rating_code: {}
};

const Monitoring_ChemicalTerrestrialAquaticPlant = {
  monitoring_details: {}
};

const Monitoring_MechanicalTerrestrialAquaticPlant = {
  monitoring_details: {}
};

const Monitoring_BiologicalTerrestrialPlant = {
  plant_count: {},
  agent_count: {},
  count_duration: {},
  agent_destroyed_ind: {
    'ui:widget': 'radio'
  },
  legacy_presence_ind: {
    'ui:widget': 'radio'
  },
  foliar_feeding_damage_ind: {
    'ui:widget': 'radio'
  },
  root_feeding_damage_ind: {
    'ui:widget': 'radio'
  },
  oviposition_marks_ind: {
    'ui:widget': 'radio'
  },
  eggs_present_ind: {
    'ui:widget': 'radio'
  },
  larvae_present_ind: {
    'ui:widget': 'radio'
  },
  pupae_present_ind: {
    'ui:widget': 'radio'
  },
  adults_present_ind: {
    'ui:widget': 'radio'
  },
  tunnels_present_ind: {
    'ui:widget': 'radio'
  },
  biological_agent_spread: {}
};

const Monitoring_MechanicalTerrestrialAnimal = {
  monitoring_details: {}
};

const Monitoring_ChemicalTerrestrialAnimal = {
  monitoring_details: {}
};

const Monitoring_BiologicalTerrestrialAnimal = {
  monitoring_details: {}
};

const PaperFile = {
  description: {}
};

const Herbicide = {
  herbicide_name: {},
  herbicide_amount: {}
};

const BaseUISchemaComponents = {
  Observation,
  Observation_PlantTerrestial,
  Observation_PlantAquatic,
  Observation_AnimalTerrestrial,
  Observation_AnimalAquatic,
  Treatment,
  Treatment_MechanicalPlant,
  Treatment_BiologicalPlant,
  Treatment_BiologicalDispersalPlant,
  Treatment_MechanicalTerrestrialAnimal,
  Treatment_ChemicalTerrestrialAnimal,
  Treatment_BiologicalTerrestrialAnimal,
  Monitoring,
  Monitoring_ChemicalTerrestrialAquaticPlant,
  Monitoring_MechanicalTerrestrialAquaticPlant,
  Monitoring_BiologicalTerrestrialPlant,
  Monitoring_MechanicalTerrestrialAnimal,
  Monitoring_ChemicalTerrestrialAnimal,
  Monitoring_BiologicalTerrestrialAnimal,
  PaperFile,
  Herbicide
};

export default BaseUISchemaComponents;
