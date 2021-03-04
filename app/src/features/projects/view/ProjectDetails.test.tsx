import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import ProjectDetails from './ProjectDetails';

const history = createMemoryHistory();

describe('ProjectDetails', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <Router history={history}>
        <ProjectDetails projectData={{}} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
