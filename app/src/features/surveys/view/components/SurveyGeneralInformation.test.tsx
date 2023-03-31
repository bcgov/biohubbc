import { cleanup, render } from '@testing-library/react';
import { SurveyContext } from 'contexts/surveyContext';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import SurveyGeneralInformation from './SurveyGeneralInformation';

describe('SurveyGeneralInformation', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly with end date', () => {
    const mockSurveyDataLoader = { data: getSurveyForViewResponse } as DataLoader<any, IGetSurveyForViewResponse, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;

    const { getByTestId } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader
        }}>
        <SurveyGeneralInformation />
      </SurveyContext.Provider>
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
            end_date: (null as unknown) as string // no end date
          }
        }
      }
    } as DataLoader<any, IGetSurveyForViewResponse, any>;
    const mockArtifactDataLoader = { data: null } as DataLoader<any, any, any>;

    const { getByTestId } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader
        }}>
        <SurveyGeneralInformation />
      </SurveyContext.Provider>
    );

    expect(getByTestId('survey_timeline').textContent).toEqual('Start Date: Oct 10, 1998');
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
        <SurveyGeneralInformation />
      </SurveyContext.Provider>
    );

    expect(container.childElementCount).toEqual(0);
  });
});
