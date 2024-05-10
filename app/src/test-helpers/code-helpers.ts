import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';

export const codes: IGetAllCodeSetsResponse = {
  management_action_type: [{ id: 1, name: 'Management action' }],
  first_nations: [{ id: 1, name: 'First nations code' }],
  agency: [{ id: 1, name: 'Funding source code' }],
  investment_action_category: [{ id: 1, agency_id: 1, name: 'Investment action category' }],
  type: [{ id: 1, name: 'Type code' }],
  program: [{ id: 1, name: 'Program' }],
  proprietor_type: [
    { id: 1, name: 'Proprietor code 1', is_first_nation: false },
    { id: 2, name: 'First Nations Land', is_first_nation: true }
  ],
  iucn_conservation_action_level_1_classification: [
    { id: 1, name: 'IUCN class 1' },
    { id: 12, name: 'IUCN class 2' }
  ],
  iucn_conservation_action_level_2_subclassification: [
    { id: 1, iucn1_id: 1, name: 'IUCN subclass 1 - 1' },
    { id: 2, iucn1_id: 2, name: 'IUCN subclass 1 - 2' }
  ],
  iucn_conservation_action_level_3_subclassification: [
    { id: 1, iucn2_id: 1, name: 'IUCN subclass 2 - 1' },
    { id: 2, iucn2_id: 2, name: 'IUCN subclass 2 - 2' }
  ],
  system_roles: [
    { id: 1, name: 'Role 1' },
    { id: 2, name: 'Role 2' }
  ],
  project_roles: [
    { id: 1, name: 'Project Role 1' },
    { id: 2, name: 'Project Role 2' }
  ],
  administrative_activity_status_type: [
    { id: 1, name: 'Pending' },
    { id: 2, name: 'Actioned' },
    { id: 3, name: 'Rejected' }
  ],
  vantage_codes: [
    { id: 1, name: 'Vantage Code 1' },
    { id: 2, name: 'Vantage Code 2' }
  ],
  intended_outcomes: [
    { id: 1, name: 'Intended Outcome 1', description: 'Description 1' },
    { id: 2, name: 'Intended Outcome 2', description: 'Description 2' }
  ],
  survey_jobs: [
    { id: 1, name: 'Survey Job 1' },
    { id: 2, name: 'Survey Job 2' }
  ],
  site_selection_strategies: [
    { id: 1, name: 'Strategy 1' },
    { id: 2, name: 'Strategy 2' }
  ],
  sample_methods: [
    { id: 1, name: 'Camera Trap', description: 'Description 1' },
    { id: 2, name: 'Aerial Transect', description: 'Description 2' }
  ],
  survey_progress: [
    { id: 1, name: 'Planning', description: 'Description 1' },
    { id: 1, name: 'In progress', description: 'Description 1' }
  ],
  method_response_metrics: [
    { id: 1, name: 'Count', description: 'Description 1' },
    { id: 2, name: 'Presence-absence', description: 'Description 2' }
  ]
};
