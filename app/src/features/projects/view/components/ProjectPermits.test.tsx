import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectPermits from './ProjectPermits';

jest.mock('../../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectForUpdate: jest.fn<Promise<object>, []>(),
    updateProject: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const mockRefresh = jest.fn();

const renderContainer = () => {
  return render(<ProjectPermits projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />);
};

describe('ProjectPermits', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForUpdate.mockClear();
    mockBiohubApi().project.updateProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with sampling conducted true', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with sampling conducted false', () => {
    const { asFragment } = render(
      <ProjectPermits
        projectForViewData={{
          ...getProjectForViewResponse,
          permit: {
            ...getProjectForViewResponse.permit,
            permits: [
              { permit_number: '123', permit_type: 'Scientific Fish Collection Permit', sampling_conducted: false }
            ]
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

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
    mockBiohubApi().project.getProjectForUpdate.mockResolvedValue({
      permit: {
        permits: [
          {
            permit_number: '123',
            permit_type: 'Scientific Fish Collection Permit',
            sampling_conducted: 'true'
          }
        ]
      }
    });

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Permits')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockBiohubApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.permit
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
      expect(mockBiohubApi().project.updateProject).toHaveBeenCalledTimes(1);
      expect(mockBiohubApi().project.updateProject).toBeCalledWith(getProjectForViewResponse.id, {
        permit: {
          permits: [
            {
              permit_number: '123',
              permit_type: 'Scientific Fish Collection Permit',
              sampling_conducted: 'true'
            }
          ]
        }
      });

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockBiohubApi().project.getProjectForUpdate.mockResolvedValue({
      permit: null
    });

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Permits')).toBeVisible();
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
    mockBiohubApi().project.getProjectForUpdate = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Permits')).toBeVisible();
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
    mockBiohubApi().project.getProjectForUpdate.mockResolvedValue({
      permit: {
        permits: [
          {
            permit_number: '123',
            permit_type: 'Scientific Fish Collection Permit',
            sampling_conducted: 'true'
          }
        ]
      }
    });
    mockBiohubApi().project.updateProject = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText, getAllByRole } = renderContainer();

    await waitFor(() => {
      expect(getByText('Permits')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockBiohubApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.permit
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
