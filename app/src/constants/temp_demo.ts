import { IProjectRecord } from 'interfaces/project-interfaces';
import moment from 'moment';

// An example of a project
export const testProject: IProjectRecord = {
  id: 1,
  project: {
    id: 1,
    name: 'Project Name',
    objectives: 'Project Objectives',
    scientific_collection_permit_number: '123456',
    management_recovery_action: 'A',
    location_description: 'Location Description',
    start_date: moment().toISOString(),
    end_date: moment().toISOString(),
    results: 'Results',
    caveats: 'Caveats',
    comments: 'Comments'
  },
  fundingAgency: {
    fundingAgency: {
      id: 1,
      funding_agency_project_id: '1',
      funding_amount: 100,
      funding_end_date: moment().toISOString(),
      funding_start_date: moment().toISOString()
    },
    agency: {
      id: 1,
      name: 'Agency',
      record_effective_date: moment().toISOString(),
      record_end_date: moment().toISOString()
    },
    landBasedClimateStrategy: {
      id: 1,
      name: 'Land Based Climate Strategy'
    }
  },
  managementActions: {
    managementActions: {
      id: 1
    },
    actionType: {
      id: 1,
      name: 'Action type',
      description: 'Action Description',
      record_effective_date: moment().toISOString(),
      record_end_date: moment().toISOString()
    }
  },
  region: {
    id: 1,
    common_code: 'Common Code'
  },
  proponent: {
    id: 1,
    name: 'Proponent Name',
    record_effective_date: moment().toISOString(),
    record_end_date: moment().toISOString()
  }
};
