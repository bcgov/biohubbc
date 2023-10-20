import { ISurveyContext, SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { MemoryRouter } from 'react-router';
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
      surveyId: 1,
      projectId: 1
    };

    const { getByText } = render(
      <MemoryRouter>
        <SurveyContext.Provider value={mockSurveyContext}>
          <SurveyObservations />
        </SurveyContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText('Observations')).toBeInTheDocument();
    });
  });
});
