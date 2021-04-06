import { cleanup, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectPage from './ProjectPage';

const history = createMemoryHistory({ initialEntries: ['/projects/1'] });

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, [number]>()
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('ProjectPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForView.mockClear();
    mockBiohubApi().codes.getAllCodeSets.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a spinner if no project is loaded', () => {
    const { asFragment } = render(
      <Router history={history}>
        <ProjectPage />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders project page when project is loaded', async () => {
    await act(async () => {
      mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);

      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        activity: [{ id: 1, name: 'activity 1' }],
        climate_change_initiative: [{ id: 1, name: 'climate change initiative 1' }]
      } as any);

      const { asFragment, findByText } = render(
        <Router history={history}>
          <ProjectPage />
        </Router>
      );

      const projectHeaderText = await findByText('Test Project Name', { selector: 'h1' });
      expect(projectHeaderText).toBeVisible();

      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('shows the project details when pathname includes /details', async () => {
    await act(async () => {
      mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);

      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        activity: [{ id: 1, name: 'activity 1' }],
        climate_change_initiative: [{ id: 1, name: 'climate change initiative 1' }]
      } as any);

      history.push('/details');

      const { asFragment } = render(
        <Router history={history}>
          <ProjectPage />
        </Router>
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('shows the project surveys when pathname includes /surveys', async () => {
    await act(async () => {
      mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);

      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        activity: [{ id: 1, name: 'activity 1' }],
        climate_change_initiative: [{ id: 1, name: 'climate change initiative 1' }]
      } as any);

      history.push('/surveys');

      const { asFragment } = render(
        <Router history={history}>
          <ProjectPage />
        </Router>
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('shows the project attachments when pathname includes /attachments', async () => {
    await act(async () => {
      mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);

      mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
        activity: [{ id: 1, name: 'activity 1' }],
        climate_change_initiative: [{ id: 1, name: 'climate change initiative 1' }]
      } as any);

      history.push('/attachments');

      const { asFragment } = render(
        <Router history={history}>
          <ProjectPage />
        </Router>
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
