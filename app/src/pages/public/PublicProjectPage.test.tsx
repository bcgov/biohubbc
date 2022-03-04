import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicProjectPage from './PublicProjectPage';
import { DialogContextProvider } from 'contexts/dialogContext';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { codes } from 'test-helpers/code-helpers';

const history = createMemoryHistory({ initialEntries: ['/admin/projects/1'] });

jest.mock('../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  public: {
    project: {
      getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, [number]>()
    }
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('PublicProjectPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().public.project.getProjectForView.mockClear();
    mockBiohubApi().codes.getAllCodeSets.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders spinner when no codes is loaded', async () => {
    mockBiohubApi().public.project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: { ...getProjectForViewResponse.project, end_date: '2100-02-26' }
    });

    const { getByTestId } = render(
      <DialogContextProvider>
        <Router history={history}>
          <PublicProjectPage />
        </Router>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByTestId('loading_spinner')).toBeVisible();
    });
  });

  it('renders public project page when project is loaded (project is active)', async () => {
    mockBiohubApi().public.project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue(codes);

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
    mockBiohubApi().public.project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: { ...getProjectForViewResponse.project, completion_status: 'Completed' }
    });
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue(codes);

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
    mockBiohubApi().public.project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: {
        ...getProjectForViewResponse.project,
        end_date: (null as unknown) as string
      }
    });
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue(codes);

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
