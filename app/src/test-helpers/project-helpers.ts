import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';

export const getProjectForViewResponse: IGetProjectForViewResponse = {
  projectId: 1,
  project: {
    project_name: 'Test Project Name',
    project_type_name: 'Type name',
    project_type: '1',
    start_date: '1998-10-10',
    end_date: '2021-02-26',
    climate_change_initiatives: [1],
    project_activities: [1]
  },
  location: {
    location_description: 'Location description',
    regions: ['Region 1', 'Region 2'],
    geometry: []
  },
  objectives: {
    objectives: 'Et ad et in culpa si',
    caveats: 'sjwer bds'
  },
  coordinator: {
    first_name: 'Amanda',
    last_name: 'Christensen',
    email_address: 'amanda@christensen.com',
    coordinator_agency: 'Amanda and associates',
    share_contact_details: 'true'
  },
  species: {
    focal_species: ['species 1', 'species 2'],
    ancillary_species: ['species 3', 'species 4']
  },
  iucn: {
    classificationDetails: [
      {
        classification: 'classification',
        subClassification1: 'sub classification 1',
        subClassification2: 'sub classification 2'
      }
    ]
  },
  funding: {
    fundingAgencies: [
      {
        agency_id: '123',
        agency_name: 'agency name',
        investment_action_category: 'investment action',
        funding_amount: 333,
        start_date: '2000-04-14',
        end_date: '2021-04-13'
      }
    ]
  },
  partnerships: {
    indigenous_partnerships: ['partner 1', 'partner 2'],
    stakeholder_partnerships: ['partner 3', 'partner 4']
  }
};
