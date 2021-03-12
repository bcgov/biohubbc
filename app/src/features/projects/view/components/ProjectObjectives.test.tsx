import { render } from '@testing-library/react';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import React from 'react';
import ProjectObjectives from './ProjectObjectives';



const projectWithDetailsData: IProjectWithDetails = {
  id: 1,
  project: {
    project_name: 'Test Project Name',
    project_type: '1',
    start_date: '1998-10-10',
    end_date: '2021-02-26',
    climate_change_initiatives: [],
    project_activities: []
  },
  location: {
    location_description: 'here and there',
    regions: [],
    geometry: []
  },
  objectives: {
    objectives: 'Et ad et in culpa si',
    caveats: 'sjwer bds'
  }
};

describe('ProjectObjectives', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<ProjectObjectives projectWithDetailsData={projectWithDetailsData} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
