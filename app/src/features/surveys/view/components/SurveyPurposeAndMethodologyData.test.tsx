import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import { codes } from 'test-helpers/code-helpers';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import { cleanup, render } from 'test-helpers/test-utils';
import SurveyPurposeAndMethodologyData from './SurveyPurposeAndMethodologyData';

describe('SurveyPurposeAndMethodologyData', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly', () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };

    const mockSurveyDataLoader = { data: getSurveyForViewResponse } as DataLoader<any, any, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSampleSiteDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockCritterDataLoader = { data: [] } as DataLoader<any, any, any>;
    const mockDeploymentDataLoader = { data: [] } as DataLoader<any, any, any>;

    const { getByTestId, getAllByTestId } = render(
      <CodesContext.Provider value={mockCodesContext}>
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
          <SurveyPurposeAndMethodologyData />
        </SurveyContext.Provider>
      </CodesContext.Provider>
    );

    expect(getByTestId('intended_outcome_codes').textContent).toEqual('Intended Outcome 1');
    expect(getAllByTestId('survey_vantage_code').map((item) => item.textContent)).toEqual([
      'Vantage Code 1',
      'Vantage Code 2'
    ]);
    expect(getByTestId('survey_additional_details').textContent).toEqual('details');
  });

  it('renders correctly with no additional details', () => {
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

    const { getByTestId, getAllByTestId, queryByTestId } = render(
      <CodesContext.Provider value={mockCodesContext}>
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
          <SurveyPurposeAndMethodologyData />
        </SurveyContext.Provider>
      </CodesContext.Provider>
    );

    expect(getByTestId('intended_outcome_codes').textContent).toEqual('Intended Outcome 1');
    expect(getAllByTestId('survey_vantage_code').map((item) => item.textContent)).toEqual([
      'Vantage Code 1',
      'Vantage Code 2'
    ]);
    expect(queryByTestId('survey_additional_details')).toBeNull();
  });
});
