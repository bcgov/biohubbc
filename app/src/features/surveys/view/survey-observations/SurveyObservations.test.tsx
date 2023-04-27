import { cleanup, render, waitFor } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { ISurveyContext, SurveyContext } from 'contexts/surveyContext';
import { DataLoader } from 'hooks/useDataLoader';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { getObservationSubmissionResponse } from 'test-helpers/survey-helpers';
import SurveyObservations from './SurveyObservations';

describe('SurveyObservations', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });

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
