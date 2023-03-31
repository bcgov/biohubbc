import { cleanup, render } from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectCoordinator from './ProjectCoordinator';

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
      <ProjectCoordinator projectForViewData={getProjectForViewResponse.projectData} />
    </DialogContextProvider>
  );
};

describe('ProjectCoordinator', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForUpdate.mockClear();
    mockBiohubApi().project.updateProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', async () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });
});
