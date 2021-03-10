import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import ProjectObjectives from './ProjectObjectives';

const history = createMemoryHistory();

describe('ProjectObjectives', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <Router history={history}>
        <ProjectObjectives projectData={{}} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
