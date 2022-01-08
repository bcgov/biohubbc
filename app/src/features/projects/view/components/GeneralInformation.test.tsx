import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import ProjectDetails from './GeneralInformation';
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
      <ProjectDetails projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    </DialogContextProvider>
  );
};

describe('ProjectDetails', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().project.getProjectForUpdate.mockClear();
    mockRestorationTrackerApi().project.updateProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no end date (only start date)', () => {
    const { asFragment } = render(
      <ProjectDetails
        projectForViewData={{
          ...getProjectForViewResponse,
          project: { ...getProjectForViewResponse.project, end_date: (null as unknown) as string }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with no activity data', () => {
    const { asFragment } = render(
      <ProjectDetails
        projectForViewData={{
          ...getProjectForViewResponse,
          project: { ...getProjectForViewResponse.project, project_activities: [] }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with activity data', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('editing the project details works in the dialog', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      project: {
        project_name: 'project name',
        project_type: 1,
        project_activities: [1, 2],
        start_date: '2020-04-20',
        end_date: '2020-05-20',
        revision_count: 2
      }
    });

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.project
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit General Information')).not.toBeInTheDocument();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.updateProject).toHaveBeenCalledTimes(1);
      expect(mockRestorationTrackerApi().project.updateProject).toBeCalledWith(getProjectForViewResponse.id, {
        project: {
          project_name: 'project name',
          project_type: 1,
          project_activities: [1, 2],
          start_date: '2020-04-20',
          end_date: '2020-05-20',
          revision_count: 2
        }
      });

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      project: undefined
    });

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Error Editing General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('Error Editing General Information')).not.toBeInTheDocument();
    });
  });

  it('shows error dialog with API error message when getting details data for update fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate = jest.fn(() =>
      Promise.reject(new Error('API Error is Here'))
    );

    const { getByText, queryByText, getAllByRole } = renderContainer();

    await waitFor(() => {
      expect(getByText('General Information')).toBeVisible();
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

  it('shows error dialog with API error message when updating details data fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      project: {
        project_name: 'project name',
        project_type: 1,
        project_activities: [1, 2],
        start_date: '2020-04-20',
        end_date: '2020-05-20',
        revision_count: 2
      }
    });
    mockRestorationTrackerApi().project.updateProject = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('General Information')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.project
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit General Information')).toBeVisible();
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
