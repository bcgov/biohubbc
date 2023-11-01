import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { IProjectAuthStateContext, ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { Router } from 'react-router';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { getSurveyForListResponse } from 'test-helpers/survey-helpers';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import SurveysListPage from './SurveysListPage';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  survey: {
    getSurveysBasicFieldsByProjectId: jest.fn()
  }
};

describe('SurveysListPage', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.survey.getSurveysBasicFieldsByProjectId.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with an empty list of surveys', async () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: getProjectForViewResponse
      } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: [] } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      projectId: 1
    };

    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasProjectPermission: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    mockUseApi.survey.getSurveysBasicFieldsByProjectId.mockResolvedValue([]);

    const { getByText } = render(
      <Router history={history}>
        <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
          <CodesContext.Provider value={mockCodesContext}>
            <ProjectContext.Provider value={mockProjectContext}>
              <SurveysListPage />
            </ProjectContext.Provider>
          </CodesContext.Provider>
        </ProjectAuthStateContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Surveys')).toBeInTheDocument();
      expect(getByText('Create Survey')).toBeInTheDocument();
      expect(getByText('No Surveys')).toBeInTheDocument();
    });
  });

  it('renders correctly with a populated list of surveys', async () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };

    const mockProjectAuthStateContext: IProjectAuthStateContext = {
      getProjectParticipant: () => null,
      hasProjectRole: () => true,
      hasProjectPermission: () => true,
      hasSystemRole: () => true,
      getProjectId: () => 1,
      hasLoadedParticipantInfo: true
    };

    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: getProjectForViewResponse
      } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: getSurveyForListResponse } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      projectId: 1
    };

    const { getByText } = render(
      <Router history={history}>
        <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
          <CodesContext.Provider value={mockCodesContext}>
            <ProjectContext.Provider value={mockProjectContext}>
              <SurveysListPage />
            </ProjectContext.Provider>
          </CodesContext.Provider>
        </ProjectAuthStateContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Surveys')).toBeInTheDocument();
      expect(getByText('Create Survey')).toBeInTheDocument();
      expect(getByText('Moose Survey 1')).toBeInTheDocument();
      expect(getByText('Moose Survey 2')).toBeInTheDocument();
    });
  });
});
