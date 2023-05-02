import { render, waitFor } from '@testing-library/react';
import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import SurveyDetails from './SurveyDetails';

describe('SurveyDetails', () => {
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
  const mockObservationsDataLoader = { data: null } as DataLoader<any, any, any>;
  const mockSummaryDataLoader = { data: null } as DataLoader<any, any, any>;

  it('renders correctly', async () => {
    const { getByText } = render(
      <SurveyContext.Provider
        value={{
          projectId: 1,
          surveyId: 1,
          surveyDataLoader: mockSurveyDataLoader,
          artifactDataLoader: mockArtifactDataLoader,
          observationDataLoader: mockObservationsDataLoader,
          summaryDataLoader: mockSummaryDataLoader
        }}>
        <CodesContext.Provider value={mockCodesContext}>
          <SurveyDetails />
        </CodesContext.Provider>
      </SurveyContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Survey Details')).toBeInTheDocument();
    });
  });
});
