import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import React from 'react';
import { Router } from 'react-router';
import ProjectAttachments from './ProjectAttachments';

const history = createMemoryHistory();

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

describe('ProjectAttachments', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <Router history={history}>
        <ProjectAttachments projectWithDetailsData={projectWithDetailsData} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
