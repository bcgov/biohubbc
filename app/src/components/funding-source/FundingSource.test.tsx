import { cleanup, render } from '@testing-library/react';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import FundingSource, { IFundingSource } from './FundingSource';
jest.mock('../../hooks/useBioHubApi');

const mockUseBiohubApi = {
  project: {
    updateProject: jest.fn(),
    addFundingSource: jest.fn(),
    deleteFundingSource: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const funding_sources: IFundingSource[] = [
  {
    id: 1,
    start_date: '1900-01-01',
    end_date: '2050-01-01',
    agency_project_id: 'Project ID',
    first_nations_name: 'First Nations'
  },
  {
    id: 2,
    agency_name: 'Agency',
    investment_action_category_name: 'Not Applicable',
    funding_amount: 500,
    start_date: '1900-01-01',
    end_date: '1900-02-02',
    agency_project_id: '1230'
  }
];

describe('FundingSource', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.updateProject.mockClear();
    mockBiohubApi().project.addFundingSource.mockClear();
    mockBiohubApi().project.deleteFundingSource.mockClear();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const mockProjectContext: IProjectContext = {
      projectDataLoader: { data: getProjectForViewResponse } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: null } as DataLoader<any, any, any>,
      projectId: 1
    };

    const { asFragment } = render(
      <ProjectContext.Provider value={mockProjectContext}>
        <FundingSource funding_sources={funding_sources} />
      </ProjectContext.Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
