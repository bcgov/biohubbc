import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { DataLoader } from 'hooks/useDataLoader';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { getSurveyForListResponse } from 'test-helpers/survey-helpers';
import { cleanup, render } from 'test-helpers/test-utils';
import ProjectDetails from './GeneralInformation';

describe('ProjectDetails', () => {
  afterEach(() => {
    cleanup();
  });

  it.skip('renders correctly with no end date (only start date)', () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: {
          ...getProjectForViewResponse,
          projectData: {
            ...getProjectForViewResponse.projectData,
            project: { ...getProjectForViewResponse.projectData.project, end_date: null as unknown as string }
          }
        }
      } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: getSurveyForListResponse } as DataLoader<any, any, any>,
      projectId: 1
    };

    const { asFragment } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <ProjectContext.Provider value={mockProjectContext}>
          <ProjectDetails />
        </ProjectContext.Provider>
      </CodesContext.Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
