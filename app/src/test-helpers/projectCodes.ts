import { IGetAllCodesResponse } from 'interfaces/useBioHubApi-interfaces';

export const codes: IGetAllCodesResponse = {
  coordinator_agency: [],
  management_action_type: [],
  climate_change_initiative: [{ id: 1, name: 'climate code' }],
  first_nations: [],
  funding_source: [],
  investment_action_category: [],
  activity: [{ id: 1, name: 'activity code' }],
  project_type: [],
  region: [],
  species: [],
  iucn_conservation_action_level_1_classification: [],
  iucn_conservation_action_level_2_subclassification: [],
  iucn_conservation_action_level_3_subclassification: []
};
