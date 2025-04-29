import { AuthStateContext } from 'contexts/authStateContext';
import { CodesContext, ICodesContext } from 'contexts/codesContext';

import { ISurveyAuthStateContext, SurveyAuthStateContext } from 'contexts/surveyAuthStateContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { codes } from 'test-helpers/code-helpers';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import { Mock } from 'vitest';
import SurveysListPage from './SurveysListPage';

const history = createMemoryHistory();

vi.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as Mock;

const mockUseApi = {
  survey: {
    getSurveysBasicFields: vi.fn()
  }
};

describe('SurveysListPage', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.survey.getSurveysBasicFields.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with an empty list of surveys', async () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes,
        load: () => {}
      } as DataLoader<any, any, any>
    };

    const mockSurveyAuthStateContext: ISurveyAuthStateContext = {
      getSurveyMember: () => null,
      hasSurveyRole: () => true,
      hasSystemRole: () => true,
      getSurveyId: () => 1,
      hasLoadedMemberInfo: true
    };

    mockUseApi.survey.getSurveysBasicFields.mockResolvedValue([]);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByTestId } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <SurveyAuthStateContext.Provider value={mockSurveyAuthStateContext}>
            <CodesContext.Provider value={mockCodesContext}>
              <SurveysListPage />
            </CodesContext.Provider>
          </SurveyAuthStateContext.Provider>
        </Router>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(getByTestId('survey-list-no-data-overlay')).toBeInTheDocument();
    });
  });

  it('renders correctly with a populated list of surveys', async () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes,
        load: () => {}
      } as DataLoader<any, any, any>
    };

    const mockSurveyAuthStateContext: ISurveyAuthStateContext = {
      getSurveyMember: () => null,
      hasSurveyRole: () => true,
      hasSystemRole: () => true,
      getSurveyId: () => 1,
      hasLoadedMemberInfo: true
    };

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <SurveyAuthStateContext.Provider value={mockSurveyAuthStateContext}>
            <CodesContext.Provider value={mockCodesContext}>
              <SurveysListPage />
            </CodesContext.Provider>
          </SurveyAuthStateContext.Provider>
        </Router>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(getByText(/^Surveys/)).toBeInTheDocument();
      expect(getByText('Create Survey')).toBeInTheDocument();
      expect(getByText('Moose Survey 1')).toBeInTheDocument();
      expect(getByText('Moose Survey 2')).toBeInTheDocument();
    });
  });
});
