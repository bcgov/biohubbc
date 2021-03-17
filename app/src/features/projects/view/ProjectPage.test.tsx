import { cleanup, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import { IGetAllCodesResponse } from 'interfaces/useBioHubApi-interfaces';
import { projectWithDetailsData } from 'test-helpers/projectWithDetailsData';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Router } from 'react-router';
import ProjectPage from './ProjectPage';

const history = createMemoryHistory({ initialEntries: ['/projects/1'] });

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  getProject: jest.fn<Promise<IProjectWithDetails>, [number]>(),
  getAllCodes: jest.fn<Promise<IGetAllCodesResponse>, []>()
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('ProjectPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().getProject.mockClear();
    mockBiohubApi().getAllCodes.mockClear();
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
      mockBiohubApi().getProject.mockResolvedValue(projectWithDetailsData);

      mockBiohubApi().getAllCodes.mockResolvedValue({
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
});
