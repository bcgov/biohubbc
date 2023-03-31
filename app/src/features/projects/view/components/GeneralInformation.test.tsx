import { cleanup, render } from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectDetails from './GeneralInformation';

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

const renderContainer = () => {
  return render(
    <DialogContextProvider>
      <ProjectDetails projectForViewData={getProjectForViewResponse.projectData} codes={codes} />
    </DialogContextProvider>
  );
};

describe('ProjectDetails', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForUpdate.mockClear();
    mockBiohubApi().project.updateProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no end date (only start date)', () => {
    const { asFragment } = render(
      <ProjectDetails
        projectForViewData={{
          ...getProjectForViewResponse.projectData,
          project: { ...getProjectForViewResponse.projectData.project, end_date: (null as unknown) as string }
        }}
        codes={codes}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with no activity data', () => {
    const { asFragment } = render(
      <ProjectDetails
        projectForViewData={{
          ...getProjectForViewResponse.projectData,
          project: { ...getProjectForViewResponse.projectData.project, project_activities: [] }
        }}
        codes={codes}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with activity data', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });
});
