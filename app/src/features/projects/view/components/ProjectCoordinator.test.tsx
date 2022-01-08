import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import ProjectCoordinator from './ProjectCoordinator';
import { DialogContextProvider } from 'contexts/dialogContext';

jest.mock('../../../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  project: {
    getProjectForUpdate: jest.fn<Promise<object>, []>(),
    updateProject: jest.fn()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

const mockRefresh = jest.fn();

const renderContainer = () => {
  return render(
    <DialogContextProvider>
      <ProjectCoordinator projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    </DialogContextProvider>
  );
};

describe('ProjectCoordinator', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().project.getProjectForUpdate.mockClear();
    mockRestorationTrackerApi().project.updateProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', async () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the project contact works in the dialog', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      coordinator: {
        first_name: 'first name',
        last_name: 'last name',
        email_address: 'email@email.com',
        coordinator_agency: 'agency 1',
        share_contact_details: 'true',
        revision_count: 1
      }
    });

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Project Contact')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.coordinator
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit Project Contact')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Project Contact')).not.toBeInTheDocument();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit Project Contact')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.updateProject).toHaveBeenCalledTimes(1);
      expect(mockRestorationTrackerApi().project.updateProject).toBeCalledWith(getProjectForViewResponse.id, {
        coordinator: {
          first_name: 'first name',
          last_name: 'last name',
          email_address: 'email@email.com',
          coordinator_agency: 'agency 1',
          share_contact_details: 'true',
          revision_count: 1
        }
      });

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      coordinator: undefined
    });

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Project Contact')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Error Editing Project Contact')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('Error Editing Project Contact')).not.toBeInTheDocument();
    });
  });

  it('shows error dialog with API error message when getting coordinator data for update fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate = jest.fn(() =>
      Promise.reject(new Error('API Error is Here'))
    );

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Project Contact')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeNull();
    });
  });

  it('shows error dialog with API error message when updating coordinator data fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      coordinator: {
        first_name: 'first name',
        last_name: 'last name',
        email_address: 'email@email.com',
        coordinator_agency: 'agency 1',
        share_contact_details: 'true',
        revision_count: 0
      }
    });
    mockRestorationTrackerApi().project.updateProject = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText, getAllByRole } = renderContainer();

    await waitFor(() => {
      expect(getByText('Project Contact')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.coordinator
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit Project Contact')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeInTheDocument();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    //@ts-ignore
    fireEvent.click(getAllByRole('presentation')[0].firstChild);

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeNull();
    });
  });
});
