import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';

export const getProjectForViewResponse: IGetProjectForViewResponse = {
  id: 1,
  project: {
    project_name: 'Test Project Name',
    project_type: '1',
    start_date: '1998-10-10',
    end_date: '2021-02-26',
    project_activities: [1],
    completion_status: 'Active',
    publish_date: '2021-01-26'
  },
  permit: {
    permits: [
      {
        permit_number: '123',
        permit_type: 'Permit type'
      }
    ]
  },
  location: {
    location_description: 'Location description',
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
  iucn: {
    classificationDetails: [
      {
        classification: 'classification',
        subClassification1: 'sub classification 1',
        subClassification2: 'sub classification 2'
      },
      {
        classification: 'classification again',
        subClassification1: 'sub classification 1 again',
        subClassification2: 'sub classification 2 again'
      }
    ]
  },
  funding: {
    fundingSources: [
      {
        id: 0,
        agency_id: 1,
        agency_name: 'agency name',
        agency_project_id: 'ABC123',
        investment_action_category: 1,
        investment_action_category_name: 'investment action',
        funding_amount: 333,
        start_date: '2000-04-14',
        end_date: '2021-04-13',
        revision_count: 1
      }
    ]
  },
  partnerships: {
    indigenous_partnerships: ['partner 1', 'partner 2'],
    stakeholder_partnerships: ['partner 3', 'partner 4']
  }
};
