import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetObservationSubmissionResponse } from 'interfaces/useObservationApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import { codes } from 'test-helpers/code-helpers';
import { getObservationSubmissionResponse, getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import { cleanup, render } from 'test-helpers/test-utils';
import SurveyGeneralInformation from './SurveyGeneralInformation';

const mockCodesContext: ICodesContext = {
  codesDataLoader: {
    data: codes,
    load: () => {}
  } as DataLoader<any, any, any>
};

describe('SurveyGeneralInformation', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly with end date', () => {
    const mockSurveyDataLoader = { data: getSurveyForViewResponse } as DataLoader<any, IGetSurveyForViewResponse, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockObservationDataLoader = { data: getObservationSubmissionResponse } as DataLoader<
      any,
      IGetObservationSubmissionResponse,
      any
    >;
    const mockSummaryDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSampleSiteDataLoader = { data: null } as DataLoader<any, any, any>;

    const { getByTestId } = render(
      <CodesContext.Provider value={mockCodesContext}>
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
          <SurveyGeneralInformation />
        </SurveyContext.Provider>
      </CodesContext.Provider>
    );

    expect(getByTestId('survey_timeline').textContent).toEqual('Oct 10, 1998 - Feb 26, 2021');
  });

  it('renders correctly with null end date', () => {
    const mockSurveyDataLoader = {
      data: {
        ...getSurveyForViewResponse,
        surveyData: {
          ...getSurveyForViewResponse.surveyData,
          survey_details: {
            ...getSurveyForViewResponse.surveyData.survey_details,
            end_date: null as unknown as string // no end date
          }
        }
      }
    } as DataLoader<any, IGetSurveyForViewResponse, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockObservationDataLoader = { data: getObservationSubmissionResponse } as DataLoader<
      any,
      IGetObservationSubmissionResponse,
      any
    >;
    const mockSummaryDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSampleSiteDataLoader = { data: null } as DataLoader<any, any, any>;

    const { getByTestId } = render(
      <CodesContext.Provider value={mockCodesContext}>
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
          <SurveyGeneralInformation />
        </SurveyContext.Provider>
      </CodesContext.Provider>
    );

    expect(getByTestId('survey_timeline').textContent).toEqual('Start Date: Oct 10, 1998');
  });

  it('renders an empty fragment if survey data has not loaded or is undefined', () => {
    const mockSurveyDataLoader = { data: undefined } as DataLoader<any, IGetSurveyForViewResponse, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockObservationDataLoader = { data: getObservationSubmissionResponse } as DataLoader<
      any,
      IGetObservationSubmissionResponse,
      any
    >;
    const mockSummaryDataLoader = { data: null } as DataLoader<any, any, any>;
    const mockSampleSiteDataLoader = { data: null } as DataLoader<any, any, any>;

    const { container } = render(
      <CodesContext.Provider value={mockCodesContext}>
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
          <SurveyGeneralInformation />
        </SurveyContext.Provider>
      </CodesContext.Provider>
    );

    expect(container.childElementCount).toEqual(0);
  });
});
