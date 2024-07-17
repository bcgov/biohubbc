import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';

export const getProjectForViewResponse: IGetProjectForViewResponse = {
  projectData: {
    project: {
      project_id: 1,
      project_name: 'Test Project Name'
    },
    objectives: {
      objectives: 'Et ad et in culpa si'
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
    participants: [
      {
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 1,
        project_role_ids: [1],
        project_role_names: ['Role 1'],
        project_role_permissions: ['Permission 1', 'Permission 2'],
        identity_source: '',
        email: 'email@email.com',
        display_name: 'Tim Taster',
        agency: '',
        user_identifier: ''
      },
      {
        project_participation_id: 2,
        project_id: 1,
        system_user_id: 2,
        project_role_ids: [1],
        project_role_names: ['Role 1'],
        project_role_permissions: ['Permission 1', 'Permission 2'],
        identity_source: '',
        email: 'email@email.com',
        display_name: 'Tom Tester',
        agency: '',
        user_identifier: ''
      }
    ]
  },
  projectSupplementaryData: {
    project_metadata_publish: {
      project_metadata_publish_id: 1,
      project_id: 1,
      event_timestamp: '2023-03-15',
      submission_uuid: '123-456-789',
      create_date: '2023-03-15',
      create_user: 1,
      update_date: '2023-03-15',
      update_user: 1,
      revision_count: 0
    }
  }
};
