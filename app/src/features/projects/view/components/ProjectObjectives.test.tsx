import { cleanup, render, fireEvent, getAllByText, waitFor } from '@testing-library/react';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import ProjectObjectives from './ProjectObjectives';
import { codes } from 'test-helpers/code-helpers';
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
      <ProjectObjectives projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    </DialogContextProvider>
  );
};

describe('ProjectObjectives', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().project.getProjectForUpdate.mockClear();
    mockRestorationTrackerApi().project.updateProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  const longData =
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean' +
    ' commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient ' +
    'montes, nascetur ridiculus mus.\n Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.\n' +
    ' Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget,' +
    ' arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.\n\n' +
    'Nullam dictum felis eu pede mollis pretium. Integer tincidunt. \n Cras dapibus. Vivamus elementum\n' +
    ' semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.\n\n ' +
    'Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius\n\n ' +
    'laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies\n ' +
    'nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper liber\n\n,' +
    'sit amet adipiscing sem neque sed ipsum. N\n\n';

  it('renders correctly when objectives length is <= 850 characters', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when objectives length is > 850 characters and caveats is empty', () => {
    const { asFragment } = render(
      <ProjectObjectives
        projectForViewData={{
          ...getProjectForViewResponse,
          objectives: { ...getProjectForViewResponse.objectives, objectives: longData, caveats: '' }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when both objectives and caveats have length is > 850 characters and are in multiple paragraphs', () => {
    const { asFragment } = render(
      <ProjectObjectives
        projectForViewData={{
          ...getProjectForViewResponse,
          objectives: { ...getProjectForViewResponse.objectives, objectives: longData, caveats: longData }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when objectives and caveats are < 850 characters and in multiple paragraphs', () => {
    const multilineObjectives = 'Paragraph1\nParagraph2\n\nParagraph3';
    const multilineCaveats = 'Paragraph1\nParagraph2\n\nParagraph3';

    const { asFragment } = render(
      <ProjectObjectives
        projectForViewData={{
          ...getProjectForViewResponse,
          objectives: {
            ...getProjectForViewResponse.objectives,
            objectives: multilineObjectives,
            caveats: multilineCaveats
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('functions as expected with the read more and read less buttons', () => {
    const { container } = render(
      <ProjectObjectives
        projectForViewData={{
          ...getProjectForViewResponse,
          objectives: { ...getProjectForViewResponse.objectives, objectives: longData, caveats: longData }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    // for finding 'project objectives'
    //@ts-ignore
    expect(getAllByText(container, 'Read More')[0]).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getAllByText(container, 'Read More')[0]);

    //@ts-ignore
    expect(getAllByText(container, 'Read Less')[0]).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getAllByText(container, 'Read Less')[0]);

    //@ts-ignore
    expect(getAllByText(container, 'Read More')[0]).toBeInTheDocument();

    // for finding 'project caveats'
    //@ts-ignore
    expect(getAllByText(container, 'Read More')[1]).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getAllByText(container, 'Read More')[1]);

    //@ts-ignore
    expect(getAllByText(container, 'Read Less')[0]).toBeInTheDocument();

    //@ts-ignore
    fireEvent.click(getAllByText(container, 'Read Less')[0]);

    //@ts-ignore
    expect(getAllByText(container, 'Read More')[1]).toBeInTheDocument();
  });

  it('editing the project objectives works in the dialog', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      objectives: {
        objectives: 'initial objectives',
        caveats: 'initial caveats',
        revision_count: 0
      }
    });

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Objectives')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.objectives
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit Project Objectives')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Project Objectives')).not.toBeInTheDocument();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit Project Objectives')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.updateProject).toHaveBeenCalledTimes(1);
      expect(mockRestorationTrackerApi().project.updateProject).toBeCalledWith(getProjectForViewResponse.id, {
        objectives: {
          objectives: 'initial objectives',
          caveats: 'initial caveats',
          revision_count: 0
        }
      });
      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      objectives: undefined
    });

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Objectives')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Error Editing Project Objectives')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('Error Editing Project Objectives')).not.toBeInTheDocument();
    });
  });

  it('shows error dialog with API error message when getting objectives data for update fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate = jest.fn(() =>
      Promise.reject(new Error('API Error is Here'))
    );

    const { getByText, queryByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Objectives')).toBeVisible();
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

  it('shows error dialog with API error message when updating objectives data fails', async () => {
    mockRestorationTrackerApi().project.getProjectForUpdate.mockResolvedValue({
      objectives: {
        objectives: 'initial objectives',
        caveats: 'initial caveats',
        revision_count: 0
      }
    });
    mockRestorationTrackerApi().project.updateProject = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText, getAllByRole } = renderContainer();

    await waitFor(() => {
      expect(getByText('Objectives')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().project.getProjectForUpdate).toBeCalledWith(getProjectForViewResponse.id, [
        UPDATE_GET_ENTITIES.objectives
      ]);
    });

    await waitFor(() => {
      expect(getByText('Edit Project Objectives')).toBeVisible();
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
