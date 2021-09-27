import { cleanup, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
//import { MemoryRouter } from 'react-router';
import ObservationSubmissionCSV, { IObservationSubmissionCSVProps } from './ObservationSubmissionCSV';

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  observation: {
    getSubmissionCSVForView: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const renderContainer = (props: IObservationSubmissionCSVProps) => {
  return render(<ObservationSubmissionCSV {...props} />);
};

describe('ObservationSubmissionCSV', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().observation.getSubmissionCSVForView.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a spinner with no data', async () => {
    const mockGetCSVData = jest.fn().mockResolvedValue(null);

    const { getByTestId } = renderContainer({ getCSVData: mockGetCSVData });

    await waitFor(() => {
      expect(getByTestId('spinner')).toBeInTheDocument();
    });
  });

  it('renders correctly with file csv data', async () => {
    const mockGetCSVData = mockBiohubApi().observation.getSubmissionCSVForView.mockResolvedValue({
      data: [
        {
          name: 'test 1',
          headers: ['header 1', 'header 2'],
          rows: [
            ['content 1', 'content 2'],
            ['content 3', 'content 4']
          ]
        },
        {
          name: 'test 2',
          headers: ['heading 1', 'heading 2'],
          rows: [
            ['awesome content 1', 'awesome content 2'],
            ['awesome content 3', 'awesome content 4']
          ]
        }
      ]
    });

    const { getByTestId } = renderContainer({ getCSVData: mockGetCSVData });

    await waitFor(() => {
      expect(getByTestId('submission-data-table')).toBeInTheDocument();
    });
  });
});
