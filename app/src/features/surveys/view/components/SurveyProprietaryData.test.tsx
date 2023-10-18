import { SurveyContext } from 'contexts/surveyContext';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetObservationSubmissionResponse } from 'interfaces/useDwcaApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import { getObservationSubmissionResponse, getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import { cleanup, render } from 'test-helpers/test-utils';
import SurveyProprietaryData from './SurveyProprietaryData';

describe('SurveyProprietaryData', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly with proprietor data', () => {
    const mockSurveyDataLoader = { data: getSurveyForViewResponse } as DataLoader<any, IGetSurveyForViewResponse, any>;
    const mockObservationDataLoader = { data: getObservationSubmissionResponse } as DataLoader<
      any,
      IGetObservationSubmissionResponse,
      any
    >;
    const mockSummaryDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSampleSiteDataLoader = { data: null } as DataLoader<any, any, any>;

    const { getByTestId } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader,
          observationDataLoader: mockObservationDataLoader,
          summaryDataLoader: mockSummaryDataLoader,
          sampleSiteDataLoader: mockSampleSiteDataLoader
        }}>
        <SurveyProprietaryData />
      </SurveyContext.Provider>
    );

    expect(getByTestId('survey_proprietor_name').textContent).toEqual('proprietor name');
    expect(getByTestId('survey_proprietor_type_name').textContent).toEqual('proprietor type name');
    expect(getByTestId('survey_category_rationale').textContent).toEqual('rationale');
  });

  it('renders correctly with null proprietor data', () => {
    const mockSurveyDataLoader = {
      data: { ...getSurveyForViewResponse, surveyData: { ...getSurveyForViewResponse.surveyData, proprietor: null } }
    } as DataLoader<any, IGetSurveyForViewResponse, any>;
    const mockObservationDataLoader = { data: getObservationSubmissionResponse } as DataLoader<
      any,
      IGetObservationSubmissionResponse,
      any
    >;
    const mockSummaryDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSampleSiteDataLoader = { data: null } as DataLoader<any, any, any>;

    const { getByTestId } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader,
          observationDataLoader: mockObservationDataLoader,
          summaryDataLoader: mockSummaryDataLoader,
          sampleSiteDataLoader: mockSampleSiteDataLoader
        }}>
        <SurveyProprietaryData />
      </SurveyContext.Provider>
    );

    expect(getByTestId('survey_not_proprietary').textContent).toEqual(
      'The data captured in this survey is not proprietary.'
    );
  });

  it('renders an empty fragment if survey data has not loaded or is undefined', () => {
    const mockSurveyDataLoader = { data: undefined } as DataLoader<any, IGetSurveyForViewResponse, any>;
    const mockObservationDataLoader = { data: getObservationSubmissionResponse } as DataLoader<
      any,
      IGetObservationSubmissionResponse,
      any
    >;
    const mockSummaryDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSampleSiteDataLoader = { data: null } as DataLoader<any, any, any>;

    const { container } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader,
          observationDataLoader: mockObservationDataLoader,
          summaryDataLoader: mockSummaryDataLoader,
          sampleSiteDataLoader: mockSampleSiteDataLoader
        }}>
        <SurveyProprietaryData />
      </SurveyContext.Provider>
    );

    expect(container.childElementCount).toEqual(0);
  });
});
