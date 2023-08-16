import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';

export const getProjectForViewResponse: IGetProjectForViewResponse = {
  projectData: {
    project: {
      project_id: 1,
      project_name: 'Test Project Name',
      project_programs: [],
      start_date: '1998-10-10',
      end_date: '2021-02-26',
      project_types: [1],
      completion_status: 'Active'
    },
    location: {
      location_description: 'Location description',
      geometry: []
    },
    objectives: {
      objectives: 'Et ad et in culpa si'
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
          classification: 1,
          subClassification1: 1,
          subClassification2: 1
        },
        {
          classification: 2,
          subClassification1: 2,
          subClassification2: 2
        }
      ]
    },
    partnerships: {
      indigenous_partnerships: [1, 2],
      stakeholder_partnerships: ['partner 3', 'partner 4']
    }
  },
  projectSupplementaryData: {
    project_metadata_publish: {
      project_metadata_publish_id: 1,
      project_id: 1,
      event_timestamp: '2023-03-15',
      queue_id: 1,
      create_date: '2023-03-15',
      create_user: 1,
      update_date: '2023-03-15',
      update_user: 1,
      revision_count: 0
    }
  }
};
