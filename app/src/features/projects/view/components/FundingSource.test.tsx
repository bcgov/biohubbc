import { cleanup, render } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import FundingSource from './FundingSource';
jest.mock('../../../../hooks/useBioHubApi');
const mockRefresh = jest.fn();

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
    const { asFragment } = render(
      <FundingSource projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
