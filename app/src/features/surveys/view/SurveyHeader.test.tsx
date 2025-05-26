import { AuthStateContext, IAuthState } from 'contexts/authStateContext';
import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { ConfigContext, IConfig } from 'contexts/configContext';
import { DialogContextProvider } from 'contexts/dialogContext';

import { ISurveyAuthStateContext, SurveyAuthStateContext } from 'contexts/surveyAuthStateContext';
import { ISurveyContext, SurveyContext } from 'contexts/surveyContext';
import SurveyHeader from 'features/surveys/view/SurveyHeader';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyChecklistResponse } from 'interfaces/useChecklistApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { codes } from 'test-helpers/code-helpers';
import { getSurveyChecklistResponse, getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import { cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import { Mock } from 'vitest';

const history = createMemoryHistory({ initialEntries: ['/admin/projects/1/surveys/2'] });

vi.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as Mock;

const mockUseApi = {
  survey: {
    publishSurvey: vi.fn(),
    deleteSurvey: vi.fn()
  }
};

const mockCodesContext: ICodesContext = {
  codesDataLoader: {
    data: codes,
    load: () => {}
  } as DataLoader<any, any, any>
};

const mockSurveyContext: ISurveyContext = {
  surveyDataLoader: {
    data: getSurveyForViewResponse
  } as DataLoader<[survey_id: number], IGetSurveyForViewResponse, unknown>,
  surveyChecklistDataLoader: {
    data: getSurveyChecklistResponse
  } as DataLoader<[survey_id: number], IGetSurveyChecklistResponse, unknown>,
  artifactDataLoader: {
    data: null
  } as DataLoader<any, any, any>,
  critterDataLoader: {
    data: null
  } as DataLoader<any, any, any>,
  surveyId: 1
};

const mockSurveyAuthStateContext: ISurveyAuthStateContext = {
  getSurveyMember: () => null,

  hasSurveyRole: () => true,
  hasSystemRole: () => true,
  getSurveyId: () => 1,
  hasLoadedMemberInfo: true
};

describe('SurveyHeader', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);

    mockUseApi.survey.deleteSurvey.mockResolvedValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = (authState: IAuthState, projectAuthState: ISurveyAuthStateContext) => {
    return render(
      <Router history={history}>
        <ConfigContext.Provider value={{ FEATURE_FLAGS: [] as string[] } as IConfig}>
          <SurveyContext.Provider value={mockSurveyContext}>
            <AuthStateContext.Provider value={authState}>
              <CodesContext.Provider value={mockCodesContext}>
                <SurveyAuthStateContext.Provider value={projectAuthState}>
                  <DialogContextProvider>
                    <SurveyHeader />
                  </DialogContextProvider>
                </SurveyAuthStateContext.Provider>
              </CodesContext.Provider>
            </AuthStateContext.Provider>
          </SurveyContext.Provider>
        </ConfigContext.Provider>
      </Router>
    );
  };

  it('deletes survey and takes user to the surveys list page when user is a system administrator', async () => {
    mockUseApi.survey.deleteSurvey.mockResolvedValue(true);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByTestId, findByText, getByText } = renderComponent(authState, mockSurveyAuthStateContext);

    const surveyHeaderText = await findByText('survey name', { selector: 'span' });
    expect(surveyHeaderText).toBeVisible();

    fireEvent.click(getByTestId('settings-survey-button'));

    await waitFor(() => {
      expect(getByText('Delete Survey')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('delete-survey-button'));

    await waitFor(() => {
      expect(
        getByText(
          'Are you sure you want to delete this survey? This will remove all attachments, observations, and other related data. This action cannot be undone.'
        )
      ).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('yes-button'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual(`/admin/`);
    });
  });
});
