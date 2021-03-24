import { render, waitFor, fireEvent } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import ProjectCoordinator from './ProjectCoordinator';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { codes } from 'test-helpers/code-helpers';

const history = createMemoryHistory();

const renderContainer = () => {
  return render(
    <Router history={history}>
      <ProjectCoordinator projectForViewData={getProjectForViewResponse} codes={codes} />
    </Router>
  );
};

describe('ProjectCoordinator', () => {
  it('renders correctly', async () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the project coordinator works in the dialog', async () => {
    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Project Coordinator')).toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit Project Coordinator')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(getByText('Edit Project Coordinator')).not.toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(getByText('Edit Project Coordinator')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual(`/projects/${getProjectForViewResponse.id}/details`);
    });
  });
});
