import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IProject } from 'interfaces/project-interfaces';
import React from 'react';
import { Router } from 'react-router';
import ProjectPage from './ProjectPage';

const history = createMemoryHistory();

jest.mock('../../hooks/useBioHubApi');
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

  it('renders blank project page', () => {
    const { asFragment } = render(
      <Router history={history}>
        <ProjectPage />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders project page with mock data', () => {
    const { asFragment } = render(
      <Router history={history}>
        <ProjectPage />
      </Router>
    );

    mockBiohubApi().getProject.mockResolvedValue({
      id: 1,
      name: 'Audra Oliver',
      objectives: 'Et ad et in culpa si',
      scientific_collection_permit_number: '',
      location_description: '',
      start_date: '1998-10-01T00:00:00.000Z',
      end_date: '2021-02-26T00:00:00.000Z',
      caveats: 'Impedit sint vel au',
      comments: 'Nisi sed omnis fugia',
      coordinator_first_name: 'Madonna',
      coordinator_last_name: 'Hunt',
      coordinator_email_address: 'robulic@mailinator.com',
      coordinator_agency_name: 'Willa Coleman',
      focal_species_name_list: 'species 1',
      regions_name_list: 'region 1'
    });

    // TODO test snapshot of a populated project page

    expect(asFragment()).toBeDefined();
  });
});
