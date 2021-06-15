import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import SurveyObservations from './SurveyObservations';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import { IGetBlocksListResponse } from 'interfaces/useObservationApi.interface';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  observation: {
    getObservationsList: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('SurveyObservations', () => {
  beforeEach(() => {
    mockBiohubApi().observation.getObservationsList.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with an empty list of observations', async () => {
    mockBiohubApi().observation.getObservationsList.mockResolvedValue({
      blocks: null
    });

    const { getByText, getByTestId } = render(
      <Router history={history}>
        <SurveyObservations
          projectForViewData={getProjectForViewResponse}
          surveyForViewData={getSurveyForViewResponse}
        />
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('observations-heading')).toBeInTheDocument();
      expect(getByText('No Observations')).toBeInTheDocument();
    });
  });

  it('renders correctly with a populated list of block observations', async () => {
    const blockObservationsList: IGetBlocksListResponse[] = [
      {
        id: 1,
        block_id: 1,
        number_of_observations: 2,
        start_time: '2021-06-15 11:00:05',
        end_time: '2021-06-15 11:18:05'
      },
      {
        id: 2,
        block_id: 2,
        number_of_observations: 4,
        start_time: '2021-06-15 11:11:05',
        end_time: '2021-06-15 11:15:05'
      }
    ];

    mockBiohubApi().observation.getObservationsList.mockResolvedValue({
      blocks: blockObservationsList
    });

    const { getByText, getByTestId } = render(
      <Router history={history}>
        <SurveyObservations
          projectForViewData={getProjectForViewResponse}
          surveyForViewData={getSurveyForViewResponse}
        />
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('observations-heading')).toBeInTheDocument();
      expect(getByText('Block 1')).toBeInTheDocument();
      expect(getByText('Block 2')).toBeInTheDocument();
      expect(getByText('11:00 AM')).toBeInTheDocument();
      expect(getByText('11:18 AM')).toBeInTheDocument();
    });
  });
});
