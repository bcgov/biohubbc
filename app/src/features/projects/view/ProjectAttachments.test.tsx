import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectAttachments from './ProjectAttachments';

const history = createMemoryHistory();

describe('ProjectAttachments', () => {
  it('renders correctly with no attachments', () => {
    const { asFragment } = render(
      <Router history={history}>
        <ProjectAttachments projectForViewData={getProjectForViewResponse} />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
