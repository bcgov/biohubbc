import { render } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import ProjectCoordinator from './ProjectCoordinator';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

const history = createMemoryHistory();

describe('ProjectCoordinator', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <Router history={history}>
        <ProjectCoordinator projectForViewData={getProjectForViewResponse} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
