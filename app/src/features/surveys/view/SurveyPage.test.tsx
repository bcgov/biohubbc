import { cleanup, render, waitFor } from '@testing-library/react';
import { SYSTEM_IDENTITY_SOURCE } from 'components/layout/Header';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext, IAuthState } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import SurveyPage from './SurveyPage';

const history = createMemoryHistory({ initialEntries: ['/admin/projects/1/surveys/1'] });

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, [number]>()
  },
  survey: {
    getSurveyForView: jest.fn<Promise<IGetSurveyForViewResponse>, [number]>(),
    publishSurvey: jest.fn(),
    deleteSurvey: jest.fn()
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
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

describe('SurveyPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForView.mockClear();
    mockBiohubApi().survey.getSurveyForView.mockClear();
    mockBiohubApi().survey.publishSurvey.mockClear();
    mockBiohubApi().survey.deleteSurvey.mockClear();
    mockBiohubApi().codes.getAllCodeSets.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = (authState: any) => {
    return render(
      <AuthStateContext.Provider value={authState as IAuthState}>
        <DialogContextProvider>
          <Router history={history}>
            <SurveyPage />
          </Router>
        </DialogContextProvider>
      </AuthStateContext.Provider>
    );
  };

  it('renders a spinner if no project is loaded', async () => {
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const { asFragment } = renderComponent(defaultAuthState);

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // it('renders a spinner if no codes is loaded', async () => {
  //   mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
  //   mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);

  //   const { asFragment } = renderComponent(defaultAuthState);

  //   await waitFor(() => {
  //     expect(asFragment()).toMatchSnapshot();
  //   });
  // });

  // it('renders a spinner if no survey is loaded', async () => {
  //   mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
  //   mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
  //     activity: [{ id: 1, name: 'activity 1' }]
  //   } as any);

  //   const { asFragment } = renderComponent(defaultAuthState);

  //   await waitFor(() => {
  //     expect(asFragment()).toMatchSnapshot();
  //   });
  // });

  // it('renders survey page when survey is loaded', async () => {
  //   mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
  //   mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);
  //   mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
  //     activity: [{ id: 1, name: 'activity 1' }]
  //   } as any);

  //   const { asFragment, findByText } = renderComponent(defaultAuthState);

  //   const surveyHeaderText = await findByText('survey name', { selector: 'h1' });

  //   await waitFor(() => {
  //     expect(surveyHeaderText).toBeVisible();
  //     expect(asFragment()).toMatchSnapshot();
  //   });
  // });

  // it('renders correctly with no end date', async () => {
  //   mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
  //   mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
  //     ...getSurveyForViewResponse,
  //     survey_details: {
  //       ...getSurveyForViewResponse.survey_details,
  //       end_date: (null as unknown) as string
  //     }
  //   });
  //   mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
  //     activity: [{ id: 1, name: 'activity 1' }]
  //   } as any);

  //   const { asFragment, findByText } = renderComponent(defaultAuthState);

  //   const surveyHeaderText = await findByText('survey name', { selector: 'h1' });

  //   await waitFor(() => {
  //     expect(surveyHeaderText).toBeVisible();
  //     expect(asFragment()).toMatchSnapshot();
  //   });
  // });

  // it('deletes survey and takes user to the surveys list page when user is a system administrator', async () => {
  //   mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
  //     activity: [{ id: 1, name: 'activity 1' }]
  //   } as any);
  //   mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
  //   mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);
  //   mockBiohubApi().survey.deleteSurvey.mockResolvedValue(true);

  //   const authState = {
  //     keycloakWrapper: {
  //       ...defaultAuthState.keycloakWrapper,
  //       systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
  //       hasSystemRole: () => true
  //     }
  //   };

  //   const { getByTestId, findByText, getByText } = renderComponent(authState);

  //   const surveyHeaderText = await findByText('survey name', { selector: 'h1' });
  //   expect(surveyHeaderText).toBeVisible();

  //   fireEvent.click(getByTestId('delete-survey-button'));

  //   await waitFor(() => {
  //     expect(
  //       getByText('Are you sure you want to delete this survey, its attachments and associated observations?')
  //     ).toBeInTheDocument();
  //   });

  //   fireEvent.click(getByTestId('yes-button'));

  //   await waitFor(() => {
  //     expect(history.location.pathname).toEqual(
  //       `/admin/projects/${getSurveyForViewResponse.survey_details.id}/surveys`
  //     );
  //   });
  // });

  // it('sees delete survey button as enabled when accessing an unpublished survey as a project administrator', async () => {
  //   mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
  //     activity: [{ id: 1, name: 'activity 1' }]
  //   } as any);
  //   mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
  //   mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
  //     ...getSurveyForViewResponse,
  //     survey_details: {
  //       ...getSurveyForViewResponse.survey_details,
  //       publish_date: ''
  //     }
  //   });
  //   mockBiohubApi().survey.deleteSurvey.mockResolvedValue(true);

  //   const authState = {
  //     keycloakWrapper: {
  //       ...defaultAuthState.keycloakWrapper,
  //       systemRoles: [SYSTEM_ROLE.PROJECT_CREATOR] as string[],
  //       hasSystemRole: jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false).mockReturnValueOnce(true)
  //     }
  //   };

  //   const { getByTestId, findByText } = renderComponent(authState);

  //   const surveyHeaderText = await findByText('survey name', { selector: 'h1' });
  //   expect(surveyHeaderText).toBeVisible();

  //   expect(getByTestId('delete-survey-button')).toBeEnabled();
  // });

  // it('sees delete survey button as disabled when accessing a published survey as a project administrator', async () => {
  //   mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
  //     activity: [{ id: 1, name: 'activity 1' }]
  //   } as any);
  //   mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
  //   mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
  //     ...getSurveyForViewResponse,
  //     survey_details: {
  //       ...getSurveyForViewResponse.survey_details,
  //       publish_date: '2021-07-07'
  //     }
  //   });
  //   mockBiohubApi().survey.deleteSurvey.mockResolvedValue(true);

  //   const authState = {
  //     keycloakWrapper: {
  //       ...defaultAuthState.keycloakWrapper,
  //       systemRoles: [SYSTEM_ROLE.PROJECT_CRETOR] as string[],
  //       hasSystemRole: jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false).mockReturnValueOnce(true)
  //     }
  //   };

  //   const { getByTestId, findByText } = renderComponent(authState);

  //   const surveyHeaderText = await findByText('survey name', { selector: 'h1' });
  //   expect(surveyHeaderText).toBeVisible();

  //   expect(getByTestId('delete-survey-button')).toBeDisabled();
  // });

  // it('does not see the delete button when accessing survey as non admin user', async () => {
  //   mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
  //     activity: [{ id: 1, name: 'activity 1' }]
  //   } as any);
  //   mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
  //   mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);

  //   const authState = {
  //     keycloakWrapper: {
  //       ...defaultAuthState.keycloakWrapper,
  //       systemRoles: ['Non Admin User'] as string[],
  //       hasSystemRole: () => false
  //     }
  //   };

  //   const { queryByTestId, findByText } = renderComponent(authState);

  //   const surveyHeaderText = await findByText('survey name', { selector: 'h1' });
  //   expect(surveyHeaderText).toBeVisible();

  //   expect(queryByTestId('delete-survey-button')).toBeNull();
  // });

  // it('publishes and unpublishes a survey', async () => {
  //   mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
  //     activity: [{ id: 1, name: 'activity 1' }]
  //   } as any);
  //   mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
  //   mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
  //     ...getSurveyForViewResponse,
  //     survey_details: {
  //       ...getSurveyForViewResponse.survey_details,
  //       publish_date: ''
  //     }
  //   });
  //   mockBiohubApi().survey.publishSurvey.mockResolvedValue({ id: 1 });

  //   const { getByTestId, findByText } = renderComponent(defaultAuthState);

  //   const publishButtonText1 = await findByText('Publish Survey');
  //   expect(publishButtonText1).toBeVisible();

  //   //re-mock response to return the survey with a non-null publish date
  //   mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
  //     ...getSurveyForViewResponse,
  //     survey_details: {
  //       ...getSurveyForViewResponse.survey_details,
  //       publish_date: '2021-10-10'
  //     }
  //   });

  //   fireEvent.click(getByTestId('publish-survey-button'));

  //   const unpublishButtonText = await findByText('Unpublish Survey');
  //   expect(unpublishButtonText).toBeVisible();

  //   //re-mock response to return the survey with a null publish date
  //   mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
  //     ...getSurveyForViewResponse,
  //     survey_details: {
  //       ...getSurveyForViewResponse.survey_details,
  //       publish_date: ''
  //     }
  //   });

  //   fireEvent.click(getByTestId('publish-survey-button'));

  //   const publishButtonText2 = await findByText('Publish Survey');
  //   expect(publishButtonText2).toBeVisible();
  // });
});
