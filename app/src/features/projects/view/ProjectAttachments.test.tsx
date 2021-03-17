import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { projectWithDetailsData } from 'test-helpers/projectWithDetailsData';
import React from 'react';
import { Router } from 'react-router';
import ProjectAttachments from './ProjectAttachments';

const history = createMemoryHistory();

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
