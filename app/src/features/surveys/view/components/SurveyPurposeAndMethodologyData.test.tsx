import { cleanup, render } from '@testing-library/react';
import { SurveyContext } from 'contexts/surveyContext';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import SurveyPurposeAndMethodologyData from './SurveyPurposeAndMethodologyData';

describe('SurveyPurposeAndMethodologyData', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly', () => {
    const mockSurveyDataLoader = { data: getSurveyForViewResponse } as DataLoader<any, IGetSurveyForViewResponse, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;

    const { getByTestId, getAllByTestId } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader
        }}>
        <SurveyPurposeAndMethodologyData codes={codes} />
      </SurveyContext.Provider>
    );

    expect(getByTestId('survey_intended_outcome').textContent).toEqual('Intended Outcome 1');
    expect(getByTestId('survey_field_method').textContent).toEqual('Recruitment');
    expect(getByTestId('survey_ecological_season').textContent).toEqual('Season 1');
    expect(getAllByTestId('survey_vantage_code').map((item) => item.textContent)).toEqual([
      'Vantage Code 1',
      'Vantage Code 2'
    ]);
    expect(getByTestId('survey_additional_details').textContent).toEqual('details');
  });

  it('renders correctly with no additional details', () => {
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

    const { getByTestId, getAllByTestId } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader
        }}>
        <SurveyPurposeAndMethodologyData codes={codes} />
      </SurveyContext.Provider>
    );

    expect(getByTestId('survey_intended_outcome').textContent).toEqual('Intended Outcome 1');
    expect(getByTestId('survey_field_method').textContent).toEqual('Recruitment');
    expect(getByTestId('survey_ecological_season').textContent).toEqual('Season 1');
    expect(getAllByTestId('survey_vantage_code').map((item) => item.textContent)).toEqual([
      'Vantage Code 1',
      'Vantage Code 2'
    ]);
    expect(getByTestId('survey_additional_details').textContent).toEqual('No additional details');
  });

  it('renders an empty fragment if survey data has not loaded or is undefined', () => {
    const mockSurveyDataLoader = { data: undefined } as DataLoader<any, IGetSurveyForViewResponse, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;

    const { container } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader
        }}>
        <SurveyPurposeAndMethodologyData codes={codes} />
      </SurveyContext.Provider>
    );

    expect(container.childElementCount).toEqual(0);
  });
});
