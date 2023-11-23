import { AuthStateContext } from 'contexts/authStateContext';
import { ISurveyContext, SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { MemoryRouter } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { getObservationSubmissionResponse } from 'test-helpers/survey-helpers';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import SurveyObservations from './SurveyObservations';

jest.mock('../../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  observation: {
    uploadObservationSubmission: jest.fn(),
    processDWCFile: jest.fn(),
    deleteObservationSubmission: jest.fn(),
    getObservationSubmissionSignedURL: jest.fn()
  }
};

describe('SurveyObservations', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const mockSurveyContext: ISurveyContext = {
      observationDataLoader: {
        data: getObservationSubmissionResponse,
        load: jest.fn(),
        refresh: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      artifactDataLoader: {} as unknown as DataLoader<any, any, any>,
      surveyDataLoader: {} as unknown as DataLoader<any, any, any>,
      summaryDataLoader: {} as unknown as DataLoader<any, any, any>,
      sampleSiteDataLoader: {} as unknown as DataLoader<any, any, any>,
      critterDataLoader: {} as unknown as DataLoader<any, any, any>,
      deploymentDataLoader: {} as unknown as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    };

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <MemoryRouter>
          <SurveyContext.Provider value={mockSurveyContext}>
            <SurveyObservations />
          </SurveyContext.Provider>
        </MemoryRouter>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Observations')).toBeInTheDocument();
    });
  });
});
