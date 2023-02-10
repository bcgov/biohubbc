import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext, IAuthState } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import SurveyHeader from 'features/surveys/view/SurveyHeader';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';

const history = createMemoryHistory({ initialEntries: ['/admin/projects/1/surveys/1'] });

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  survey: {
    publishSurvey: jest.fn(),
    deleteSurvey: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const defaultAuthState = {
  keycloakWrapper: {
    keycloak: {
      authenticated: true
    },
    hasLoadedAllUserInfo: true,
    systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
    getUserIdentifier: () => 'testuser',
    hasAccessRequest: false,
    hasSystemRole: () => true,
    getIdentitySource: () => SYSTEM_IDENTITY_SOURCE.IDIR,
    username: 'testusername',
    displayName: 'testdisplayname',
    email: 'test@email.com',
    firstName: 'testfirst',
    lastName: 'testlast',
    refresh: () => {}
  }
};

const surveyForView = getSurveyForViewResponse;
const projectForView = getProjectForViewResponse;
const refresh = jest.fn();

describe('SurveyPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().survey.publishSurvey.mockClear();
    mockBiohubApi().survey.deleteSurvey.mockClear();
    refresh.mockClear();

    // jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = (authState: any, surveyData: IGetSurveyForViewResponse) => {
    return render(
      <AuthStateContext.Provider value={authState as IAuthState}>
        <DialogContextProvider>
          <Router history={history}>
            <SurveyHeader projectWithDetails={projectForView} surveyWithDetails={surveyData} refresh={refresh} />
          </Router>
        </DialogContextProvider>
      </AuthStateContext.Provider>
    );
  };

  it('deletes survey and takes user to the surveys list page when user is a system administrator', async () => {
    mockBiohubApi().survey.deleteSurvey.mockResolvedValue(true);

    const authState = {
      keycloakWrapper: {
        ...defaultAuthState.keycloakWrapper,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
        hasSystemRole: () => true
      }
    };

    const { getByTestId, findByText, getByText } = renderComponent(authState, surveyForView);

    const surveyHeaderText = await findByText('survey name', { selector: 'h1 span' });
    expect(surveyHeaderText).toBeVisible();

    fireEvent.click(getByTestId('delete-survey-button'));

    await waitFor(() => {
      expect(
        getByText('Are you sure you want to delete this survey, its attachments and associated observations?')
      ).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('yes-button'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual(
        `/admin/projects/${surveyForView.surveyData.survey_details.id}/surveys`
      );
    });
  });

  it('does not see the delete button when accessing survey as non admin user', async () => {
    const authState = {
      keycloakWrapper: {
        ...defaultAuthState.keycloakWrapper,
        systemRoles: ['Non Admin User'] as string[],
        hasSystemRole: () => false
      }
    };

    const { queryByTestId, findByText } = renderComponent(authState, surveyForView);

    const surveyHeaderText = await findByText('survey name', { selector: 'h1 span' });
    expect(surveyHeaderText).toBeVisible();

    expect(queryByTestId('delete-survey-button')).toBeNull();
  });
});
