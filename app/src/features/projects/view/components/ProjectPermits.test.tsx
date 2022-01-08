import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectPermits from './ProjectPermits';

jest.mock('../../../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  project: {
    getProjectForUpdate: jest.fn<Promise<object>, []>(),
    updateProject: jest.fn()
  },
  permit: {
    getNonSamplingPermits: jest.fn<Promise<object>, []>()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

const mockRefresh = jest.fn();

const renderContainer = () => {
  return render(
    <DialogContextProvider>
      <ProjectPermits projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    </DialogContextProvider>
  );
};

describe('ProjectPermits', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().project.getProjectForUpdate.mockClear();
    mockRestorationTrackerApi().project.updateProject.mockClear();
    mockRestorationTrackerApi().permit.getNonSamplingPermits.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with sampling conducted true', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with no permits', () => {
    const { asFragment } = render(
      <ProjectPermits
        projectForViewData={{
          ...getProjectForViewResponse,
          permit: {
            permits: []
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the permits works in the dialog', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      permit: {
        permits: [
          {
            permit_number: '123',
            permit_type: 'Scientific Fish Collection Permit'
          }
        ]
      },
      coordinator: {
        first_name: 'first',
        last_name: 'last',
        email_address: 'email@example.com',
        coordinator_agency: 'agency',
        share_contact_details: 'true',
        revision_count: 1
      }
    });
    mockRestorationTrackerApi().permit.getNonSamplingPermits.mockResolvedValue([
      { permit_id: 1, number: 1, type: 'Wildlife' }
    ]);

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Project Permits')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.permit,
        UPDATE_GET_ENTITIES.coordinator
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit Permits')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Permits')).not.toBeInTheDocument();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit Permits')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.updateProject).toHaveBeenCalledTimes(1);
      expect(mockRestorationTrackerApi().project.updateProject).toBeCalledWith(getProjectForViewResponse.id, {
        permit: {
          permits: [
            {
              permit_number: '123',
              permit_type: 'Scientific Fish Collection Permit'
            }
          ]
        },
        coordinator: {
          first_name: 'first',
          last_name: 'last',
          email_address: 'email@example.com',
          coordinator_agency: 'agency',
          share_contact_details: 'true',
          revision_count: 1
        }
      });

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      permit: null
    });
    mockRestorationTrackerApi().permit.getNonSamplingPermits.mockResolvedValue([
      { permit_id: 1, number: 1, type: 'Wildlife' }
    ]);

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Project Permits')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Error Editing Permits')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('Error Editing Permits')).not.toBeInTheDocument();
    });
  });

  it('shows error dialog with API error message when getting permit data for update fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate = jest.fn(() =>
      Promise.reject(new Error('API Error is Here'))
    );
    mockRestorationTrackerApi().permit.getNonSamplingPermits.mockResolvedValue([
      { permit_id: 1, number: 1, type: 'Wildlife' }
    ]);

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Project Permits')).toBeVisible();
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

  it('shows error dialog with API error message when updating permit data fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      permit: {
        permits: [
          {
            permit_number: '123',
            permit_type: 'Scientific Fish Collection Permit'
          }
        ]
      },
      coordinator: {
        first_name: 'first',
        last_name: 'last',
        email_address: 'email@example.com',
        coordinator_agency: 'agency',
        share_contact_details: 'true',
        revision_count: 1
      }
    });
    mockRestorationTrackerApi().permit.getNonSamplingPermits.mockResolvedValue([
      { permit_id: 1, number: 1, type: 'Wildlife' }
    ]);
    mockRestorationTrackerApi().project.updateProject = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText, getAllByRole } = renderContainer();

    await waitFor(() => {
      expect(getByText('Project Permits')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.permit,
        UPDATE_GET_ENTITIES.coordinator
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit Permits')).toBeVisible();
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
