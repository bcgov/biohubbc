import { cleanup, render, waitFor } from '@testing-library/react';
import { AuthStateContext, IAuthState } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { ISurveyContext, SurveyContext } from 'contexts/surveyContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { MemoryRouter, Router } from 'react-router';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import SurveySummaryResults from './SurveySummaryResults';

jest.mock('../../../hooks/useBioHubApi');

const history = createMemoryHistory({ initialEntries: ['/admin/projects/1/surveys/1'] });
const mockUseBiohubApi = {
  observation: {
    getObservationSubmission: jest.fn()
  }
};

const mockSurveyContext: ISurveyContext = {
  surveyDataLoader: {
    data: getSurveyForViewResponse
  } as DataLoader<[project_id: number, survey_id: number], IGetSurveyForViewResponse, unknown>,
  artifactDataLoader: {
    data: null
  } as DataLoader<any, any, any>,
  surveyId: 1,
  projectId: 1
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const renderComponent = (authState: any, surveyData: IGetSurveyForViewResponse) => {
  return render(
    <SurveyContext.Provider value={mockSurveyContext}>
      <AuthStateContext.Provider value={authState as IAuthState}>
        <DialogContextProvider>
          <Router history={history}>
            <SurveySummaryResults />
          </Router>
        </DialogContextProvider>
      </AuthStateContext.Provider>
    </SurveyContext.Provider>
  );
};

describe.only('SurveySummaryResults', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().observation.getObservationSubmission.mockClear();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  /*
  no summary
    loading
    got summary errors
    file card
  */
  it('no summary results should be shown', async () => {});
  it('should show loading progress bar', async () => {});
  it('summary result upload errors', async () => {});
  it('should show file card with data', async () => {});

  it('renders correctly', async () => {
    const { getByText } = render(
      <MemoryRouter>
        <SurveySummaryResults />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText('Observations')).toBeInTheDocument();
      expect(mockBiohubApi().observation.getObservationSubmission).toHaveBeenCalledTimes(2);
    });
  });

  it('shows circular spinner when observation data not yet loaded', async () => {
    const { asFragment } = render(
      <MemoryRouter>
        <SurveySummaryResults />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
