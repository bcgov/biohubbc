import { cleanup, render } from '@testing-library/react';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import FundingSource from './FundingSource';
jest.mock('../../../../hooks/useBioHubApi');

jest.mock('../../../../hooks/useBioHubApi');
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
      projectId: 1
    };

    const { asFragment } = render(
      <ProjectContext.Provider value={mockProjectContext}>
        <FundingSource />
      </ProjectContext.Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
