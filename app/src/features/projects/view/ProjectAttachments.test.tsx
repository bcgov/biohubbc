import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import ProjectAttachments from './ProjectAttachments';

const history = createMemoryHistory();

describe('ProjectAttachments', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <Router history={history}>
        <ProjectAttachments projectData={{}} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
