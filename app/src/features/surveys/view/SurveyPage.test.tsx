import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import { AuthStateContext, IAuthState } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import SurveyPage from './SurveyPage';

const history = createMemoryHistory({ initialEntries: ['/admin/projects/1/surveys/1'] });

jest.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  project: {
    getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, []>()
  },
  survey: {
    getSurveyForView: jest.fn<Promise<IGetSurveyForViewResponse>, []>()
  },
  observation: {
    getObservationSubmission: jest.fn()
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  },
  external: {
    post: jest.fn().mockResolvedValue([])
  }
};

describe.skip('SurveyPage', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.project.getProjectForView.mockClear();
    mockUseApi.survey.getSurveyForView.mockClear();
    mockUseApi.observation.getObservationSubmission.mockClear();
    mockUseApi.codes.getAllCodeSets.mockClear();
    mockUseApi.external.post.mockClear();

    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = (authState: IAuthState) => {
    return render(
      <AuthStateContext.Provider value={authState}>
        <DialogContextProvider>
          <Router history={history}>
            <SurveyPage />
          </Router>
        </DialogContextProvider>
      </AuthStateContext.Provider>
    );
  };

  it('renders a spinner if no project is loaded', async () => {
    mockUseApi.survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);
    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { asFragment } = renderComponent(authState);

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders a spinner if no codes is loaded', async () => {
    mockUseApi.project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockUseApi.survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { asFragment } = renderComponent(authState);

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders a spinner if no survey is loaded', async () => {
    mockUseApi.project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { asFragment } = renderComponent(authState);

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders survey page when survey is loaded', async () => {
    mockUseApi.project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockUseApi.survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);
    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { asFragment, findByText } = renderComponent(authState);

    const surveyHeaderText = await findByText('survey name', { selector: 'h1 span' });

    await waitFor(() => {
      expect(surveyHeaderText).toBeVisible();
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders correctly with no end date', async () => {
    mockUseApi.project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockUseApi.survey.getSurveyForView.mockResolvedValue({
      ...getSurveyForViewResponse,
      surveyData: {
        ...getSurveyForViewResponse.surveyData,
        survey_details: {
          ...getSurveyForViewResponse.surveyData.survey_details,
          end_date: (null as unknown) as string
        }
      }
    });
    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { asFragment, findByText } = renderComponent(authState);

    const surveyHeaderText = await findByText('survey name', { selector: 'h1 span' });

    await waitFor(() => {
      expect(surveyHeaderText).toBeVisible();
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
