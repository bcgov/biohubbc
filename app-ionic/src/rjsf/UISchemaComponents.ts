/**
 * This file should contain any UI Schema items that have one or more nested elements.
 *
 * Example of schema item with nested element:
 *
 * const Obj = {
 *   some_nested_field: {
 *      ...nested_field_properties
 *   }
 * }
 */

import BaseUISchemaComponents from 'rjsf/BaseUISchemaComponents';

const Treatment_ChemicalPlant = {
  primary_applicator_employee_code: {},
  secondary_applicator_employee_code: {},
  pesticide_employer_code: {},
  project_management_plan_PMP: {},
  pesticide_use_permit_PUP: {},
  chemical_treatment_method: {},
  temperature: {},
  wind_speed: {},
  wind_direction_code: {},
  humidity: {},
  mix_delivery_rate: {},
  application_rate: {},
  area_treated: {},
  herbicide: {
    items: {
      ...BaseUISchemaComponents.Herbicide
    }
  }
};

const Activity = {
  species_agency_code: {},
  jurisdiction_code: {},
  activity_status: {},
  species_id: {},
  general_comment: {
    'ui:widget': 'textarea'
  },
  access_description: {
    'ui:widget': 'textarea'
  },
  media_indicator: {
    'ui:widget': 'radio'
  },
  created_date_on_device: {
    'ui:widget': 'date'
  },
  updated_date_on_device: {
    'ui:widget': 'date'
  },
  paper_file: {
    items: {
      ...BaseUISchemaComponents.PaperFile
    }
  }
};

const UISchemaComponents = {
  Treatment_ChemicalPlant,
  Activity
};

export default UISchemaComponents;
