import { cleanup, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { MemoryRouter } from 'react-router';
import SurveyObservations from './SurveyObservations';

jest.mock('../../../hooks/useBioHubApi');

const mockUseBiohubApi = {
  observation: {
    getObservationSubmission: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('SurveyObservations', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().observation.getObservationSubmission.mockClear();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const { getByText } = render(
      <MemoryRouter>
        <SurveyObservations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText('Observations')).toBeInTheDocument();
      expect(mockBiohubApi().observation.getObservationSubmission).toHaveBeenCalledTimes(1);
    });
  });

  it('shows circular spinner when observation data not yet loaded', async () => {
    const { asFragment } = render(
      <MemoryRouter>
        <SurveyObservations />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
