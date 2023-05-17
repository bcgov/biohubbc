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
const mockUseBiohubApi = {
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

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe.skip('SurveyPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectForView.mockClear();
    mockBiohubApi().survey.getSurveyForView.mockClear();
    mockBiohubApi().observation.getObservationSubmission.mockClear();
    mockBiohubApi().codes.getAllCodeSets.mockClear();
    mockBiohubApi().external.post.mockClear();

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
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { asFragment } = renderComponent(authState);

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders a spinner if no codes is loaded', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { asFragment } = renderComponent(authState);

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders a spinner if no survey is loaded', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { asFragment } = renderComponent(authState);

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders survey page when survey is loaded', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue(getSurveyForViewResponse);
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
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
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().survey.getSurveyForView.mockResolvedValue({
      ...getSurveyForViewResponse,
      surveyData: {
        ...getSurveyForViewResponse.surveyData,
        survey_details: {
          ...getSurveyForViewResponse.surveyData.survey_details,
          end_date: (null as unknown) as string
        }
      }
    });
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
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
