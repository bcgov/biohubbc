import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { DataLoader } from 'hooks/useDataLoader';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import ProjectDetails from './ProjectDetails';

describe('ProjectDetails', () => {
  afterEach(() => {
    cleanup();
  });

  it.skip('renders correctly', async () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };

    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: getProjectForViewResponse
      } as DataLoader<any, any, any>,
      artifactDataLoader: {
        data: null,
        load: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      projectId: 1
    } as unknown as IProjectContext;

    const { asFragment } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <ProjectContext.Provider value={mockProjectContext}>
          <ProjectDetails />
        </ProjectContext.Provider>
      </CodesContext.Provider>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
