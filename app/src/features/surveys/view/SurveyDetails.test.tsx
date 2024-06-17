import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { createMemoryHistory } from 'history';
import { GetRegionsResponse } from 'hooks/api/useSpatialApi';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import { Router } from 'react-router';
import { codes } from 'test-helpers/code-helpers';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import { render, waitFor } from 'test-helpers/test-utils';
import { useBiohubApi } from '../../../hooks/useBioHubApi';
import SurveyDetails from './SurveyDetails';

const history = createMemoryHistory({ initialEntries: ['/admin/projects/1/surveys/2'] });

jest.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  spatial: {
    getRegions: jest.fn<Promise<GetRegionsResponse>, []>()
  }
};

describe('SurveyDetails', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.spatial.getRegions.mockClear();

    mockUseApi.spatial.getRegions.mockResolvedValue({
      regions: []
    });
  });

  const mockCodesContext: ICodesContext = {
    codesDataLoader: {
      data: codes
    } as DataLoader<any, any, any>
  };

  const mockSurveyDataLoader = {
    data: {
      ...getSurveyForViewResponse,
      surveyData: {
        ...getSurveyForViewResponse.surveyData,
        purpose_and_methodology: {
          ...getSurveyForViewResponse.surveyData.purpose_and_methodology,
          additional_details: '' // no additional details
        }
      }
    }
  } as DataLoader<any, IGetSurveyForViewResponse, any>;
  const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
  const mockSampleSiteDataLoader = { data: null } as DataLoader<any, any, any>;
  const mockCritterDataLoader = { data: [] } as DataLoader<any, any, any>;
  const mockDeploymentDataLoader = { data: [] } as DataLoader<any, any, any>;

  it('renders correctly', async () => {
    const { getByText } = render(
      <Router history={history}>
        <SurveyContext.Provider
          value={{
            projectId: 1,
            surveyId: 1,
            critterDeployments: [],
            surveyDataLoader: mockSurveyDataLoader,
            artifactDataLoader: mockArtifactDataLoader,
            sampleSiteDataLoader: mockSampleSiteDataLoader,
            critterDataLoader: mockCritterDataLoader,
            deploymentDataLoader: mockDeploymentDataLoader
          }}>
          <CodesContext.Provider value={mockCodesContext}>
            <SurveyDetails />
          </CodesContext.Provider>
        </SurveyContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Survey Details')).toBeInTheDocument();
    });
  });
});
