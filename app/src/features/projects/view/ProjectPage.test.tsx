import { cleanup, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IProject } from 'interfaces/project-interfaces';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Router } from 'react-router';
import ProjectPage from './ProjectPage';

const history = createMemoryHistory({ initialEntries: ['/projects/1'] });

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  getProject: jest.fn<Promise<IProject>, [number]>()
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('ProjectPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().getProject.mockClear();
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
      mockBiohubApi().getProject.mockResolvedValue({
        id: 1,
        name: 'Test Project Name',
        objectives: 'Et ad et in culpa si',
        scientific_collection_permit_number: '',
        location_description: '',
        start_date: '1998-10-10',
        end_date: '2021-02-26',
        caveats: 'Impedit sint vel au',
        comments: 'Nisi sed omnis fugia',
        coordinator_first_name: 'Madonna',
        coordinator_last_name: 'Hunt',
        coordinator_email_address: 'robulic@mailinator.com',
        coordinator_agency_name: 'Willa Coleman',
        focal_species_name_list: 'species 1, species 2',
        regions_name_list: 'region 1, region 2, region 3'
      });

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
