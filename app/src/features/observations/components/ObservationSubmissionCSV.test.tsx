import { cleanup, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { MemoryRouter } from 'react-router';
import ObservationSubmissionCSV from './ObservationSubmissionCSV';

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  observation: {
    getSubmissionCSVForView: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const submissionId = 1;

const renderContainer = () => {
  return render(
    <MemoryRouter>
      <ObservationSubmissionCSV submissionId={submissionId} />
    </MemoryRouter>
  );
};

describe('ObservationSubmissionCSV', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().observation.getSubmissionCSVForView.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with file contents', async () => {
    mockBiohubApi().observation.getSubmissionCSVForView.mockResolvedValue({
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

    const { asFragment } = renderContainer();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
