import { IProjectWithDetails } from 'interfaces/project-interfaces';

export const projectWithDetailsData: IProjectWithDetails = {
  id: 1,
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
  }
};
