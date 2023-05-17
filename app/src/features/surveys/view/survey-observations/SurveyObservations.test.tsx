import { cleanup, cleanup, render, waitFor } from 'test-helpers/test-utils';
import { ISurveyContext, SurveyContext } from 'contexts/surveyContext';
import { DataLoader } from 'hooks/useDataLoader';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { getObservationSubmissionResponse } from 'test-helpers/survey-helpers';
import SurveyObservations from './SurveyObservations';

describe('SurveyObservations', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const mockSurveyContext: ISurveyContext = ({
      observationDataLoader: ({
        data: getObservationSubmissionResponse,
        load: jest.fn(),
        refresh: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown) as ISurveyContext;

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
