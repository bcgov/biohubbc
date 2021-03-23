import { render, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import ProjectCoordinator from './ProjectCoordinator';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { useBiohubApi } from 'hooks/useBioHubApi';

const history = createMemoryHistory();

jest.mock('../../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  codes: {
    getAllCodeSets: jest.fn<Promise<object>, []>()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const renderContainer = () => {
  return render(
    <Router history={history}>
      <ProjectCoordinator projectForViewData={getProjectForViewResponse} />
    </Router>
  );
};

describe('ProjectCoordinator', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().codes.getAllCodeSets.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a spinner when no codes', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when codes retrieved successfully', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'A Rocha Canada' }]
    });

    const { getByText, asFragment } = renderContainer();

    await waitFor(() => {
      expect(getByText('Project Coordinator')).toBeVisible();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('editing the project coordinator works in the dialog', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [
        { id: 1, name: 'A Rocha Canada' },
        { id: 2, name: 'Aarde Environmental Ltd.' },
        { id: 3, name: 'Acres Consulting' }
      ]
    });

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
