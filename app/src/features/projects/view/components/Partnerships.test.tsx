import { render, waitFor, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import Partnerships from './Partnerships';
import { codes } from 'test-helpers/code-helpers';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
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

describe('Partnerships', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().project.getProjectForUpdate.mockClear();
    mockRestorationTrackerApi().project.updateProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Partnerships
        projectForViewData={{
          ...getProjectForViewResponse,
          partnerships: {
            indigenous_partnerships: [],
            stakeholder_partnerships: []
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with invalid null values', () => {
    const { asFragment } = render(
      <Partnerships
        projectForViewData={{
          ...getProjectForViewResponse,
          partnerships: {
            indigenous_partnerships: (null as unknown) as string[],
            stakeholder_partnerships: (null as unknown) as string[]
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing partnership values', () => {
    const { asFragment } = render(
      <Partnerships projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the partnerships works in the dialog', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      partnerships: {
        indigenous_partnerships: [1, 2],
        stakeholder_partnerships: ['partner 1', 'partner 2']
      }
    });

    const { getByText, queryByText } = render(
      <Partnerships projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    await waitFor(() => {
      expect(getByText('Partnerships')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.partnerships
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit Partnerships')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Partnerships')).not.toBeInTheDocument();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit Partnerships')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.updateProject).toHaveBeenCalledTimes(1);
      expect(mockRestorationTrackerApi().project.updateProject).toBeCalledWith(getProjectForViewResponse.id, {
        partnerships: {
          indigenous_partnerships: [1, 2],
          stakeholder_partnerships: ['partner 1', 'partner 2']
        }
      });

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      partnerships: null
    });

    const { getByText, queryByText } = render(
      <DialogContextProvider>
        <Partnerships projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Partnerships')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Error Editing Partnerships')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('Error Editing Partnerships')).not.toBeInTheDocument();
    });
  });

  it('shows error dialog with API error message when getting partnerships data for update fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate = jest.fn(() =>
      Promise.reject(new Error('API Error is Here'))
    );

    const { getByText, queryByText, getAllByRole } = render(
      <DialogContextProvider>
        <Partnerships projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Partnerships')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

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

  it('shows error dialog with API error message when updating partnerships data fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      partnerships: {
        indigenous_partnerships: [1, 2],
        stakeholder_partnerships: ['partner 1', 'partner 2']
      }
    });
    mockRestorationTrackerApi().project.updateProject = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText } = render(
      <DialogContextProvider>
        <Partnerships projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Partnerships')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.partnerships
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit Partnerships')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeNull();
    });
  });
});
