import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { getSurveyForListResponse } from 'test-helpers/survey-helpers';
import { cleanup, render } from 'test-helpers/test-utils';
import Partnerships from './Partnerships';

jest.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  project: {
    getProjectForUpdate: jest.fn<Promise<object>, []>(),
    updateProject: jest.fn()
  }
};

describe('Partnerships', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.project.getProjectForUpdate.mockClear();
    mockUseApi.project.updateProject.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it.skip('renders correctly with default empty values', () => {
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
            partnerships: {
              indigenous_partnerships: [],
              stakeholder_partnerships: []
            }
          }
        }
      } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: getSurveyForListResponse } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      projectId: 1
    };

    const { asFragment } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <ProjectContext.Provider value={mockProjectContext}>
          <Partnerships />
        </ProjectContext.Provider>
      </CodesContext.Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it.skip('renders correctly with invalid null values', () => {
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
            partnerships: {
              indigenous_partnerships: null as unknown as number[],
              stakeholder_partnerships: null as unknown as string[]
            }
          }
        }
      } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: getSurveyForListResponse } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      projectId: 1
    };

    const { asFragment } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <ProjectContext.Provider value={mockProjectContext}>
          <Partnerships />
        </ProjectContext.Provider>
      </CodesContext.Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it.skip('renders correctly with existing partnership values', () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: getProjectForViewResponse
      } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: getSurveyForListResponse } as DataLoader<any, any, any>,
      projectId: 1
    };

    const { asFragment } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <ProjectContext.Provider value={mockProjectContext}>
          <Partnerships />
        </ProjectContext.Provider>
      </CodesContext.Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
