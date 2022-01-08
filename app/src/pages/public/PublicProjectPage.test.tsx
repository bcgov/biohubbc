import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicProjectPage from './PublicProjectPage';
import { DialogContextProvider } from 'contexts/dialogContext';

const history = createMemoryHistory({ initialEntries: ['/admin/projects/1'] });

jest.mock('../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  public: {
    project: {
      getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, [number]>()
    }
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

describe('PublicProjectPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().public.project.getProjectForView.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a spinner if no project is loaded', () => {
    const { asFragment } = render(
      <DialogContextProvider>
        <Router history={history}>
          <PublicProjectPage />
        </Router>
      </DialogContextProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders public project page when project is loaded (project is active)', async () => {
    mockRestorationTrackerApi().public.project.getProjectForView.mockResolvedValue(getProjectForViewResponse);

    const { asFragment, findByText } = render(
      <DialogContextProvider>
        <Router history={history}>
          <PublicProjectPage />
        </Router>
      </DialogContextProvider>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1' });
    expect(projectHeaderText).toBeVisible();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders public project page when project is loaded (project is completed)', async () => {
    mockRestorationTrackerApi().public.project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: { ...getProjectForViewResponse.project, completion_status: 'Completed' }
    });

    const { asFragment, findByText } = render(
      <DialogContextProvider>
        <Router history={history}>
          <PublicProjectPage />
        </Router>
      </DialogContextProvider>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1' });
    expect(projectHeaderText).toBeVisible();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders correctly with no end date', async () => {
    mockRestorationTrackerApi().public.project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: {
        ...getProjectForViewResponse.project,
        end_date: (null as unknown) as string
      }
    });

    const { asFragment, findByText } = render(
      <Router history={history}>
        <PublicProjectPage />
      </Router>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1' });
    expect(projectHeaderText).toBeVisible();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
