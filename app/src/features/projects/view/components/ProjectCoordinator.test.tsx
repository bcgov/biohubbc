import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForUpdateResponse, UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { Router } from 'react-router-dom';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectCoordinator from './ProjectCoordinator';

const history = createMemoryHistory();

jest.mock('../../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectForUpdate: jest.fn<Promise<IGetProjectForUpdateResponse>, ['number', UPDATE_GET_ENTITIES[]]>(),
    updateProject: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const mockRefresh = jest.fn();

const renderContainer = () => {
  return render(
    <Router history={history}>
      <ProjectCoordinator projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    </Router>
  );
};

describe('ProjectCoordinator', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForUpdate.mockClear();
    mockBiohubApi().project.updateProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', async () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the project coordinator works in the dialog', async () => {
    mockBiohubApi().project.getProjectForUpdate.mockResolvedValue({
      coordinator: {
        first_name: 'first name',
        last_name: 'last name',
        email_address: 'email@email.com',
        coordinator_agency: 'agency 1',
        share_contact_details: 'true',
        revision_count: 0
      }
    });

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Project Coordinator')).toBeVisible();
    });

    fireEvent.click(getByText('EDIT'));

    await waitFor(() => {
      expect(mockBiohubApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.coordinator
      ]);
    });

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
      expect(mockBiohubApi().project.updateProject).toHaveBeenCalledTimes(1);
      expect(mockBiohubApi().project.updateProject).toBeCalledWith(getProjectForViewResponse.id, {
        coordinator: {
          first_name: 'first name',
          last_name: 'last name',
          email_address: 'email@email.com',
          coordinator_agency: 'agency 1',
          share_contact_details: 'true',
          revision_count: 0
        }
      });

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });
});
