import { cleanup, render } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import Partnerships from './Partnerships';

jest.mock('../../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectForUpdate: jest.fn<Promise<object>, []>(),
    updateProject: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('Partnerships', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForUpdate.mockClear();
    mockBiohubApi().project.updateProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Partnerships
        projectForViewData={{
          ...getProjectForViewResponse.projectData,
          partnerships: {
            indigenous_partnerships: [],
            stakeholder_partnerships: []
          }
        }}
        codes={codes}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with invalid null values', () => {
    const { asFragment } = render(
      <Partnerships
        projectForViewData={{
          ...getProjectForViewResponse.projectData,
          partnerships: {
            indigenous_partnerships: (null as unknown) as number[],
            stakeholder_partnerships: (null as unknown) as string[]
          }
        }}
        codes={codes}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing partnership values', () => {
    const { asFragment } = render(
      <Partnerships projectForViewData={getProjectForViewResponse.projectData} codes={codes} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
