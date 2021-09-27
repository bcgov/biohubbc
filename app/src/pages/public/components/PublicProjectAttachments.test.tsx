import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicProjectAttachments from './PublicProjectAttachments';

const history = createMemoryHistory();
jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  public: {
    project: {
      getProjectAttachments: jest.fn()
    }
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('PublicProjectAttachments', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().public.project.getProjectAttachments.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no attachments', () => {
    const { getByText } = render(
      <Router history={history}>
        <PublicProjectAttachments projectForViewData={getProjectForViewResponse} />
      </Router>
    );

    expect(getByText('No Attachments')).toBeInTheDocument();
  });

  it('renders correctly with attachments', async () => {
    mockBiohubApi().public.project.getProjectAttachments.mockResolvedValue({
      attachmentsList: [
        {
          id: 1,
          fileName: 'filename.test',
          lastModified: '2021-04-09 11:53:53',
          size: 3028
        }
      ]
    });

    const { getByText } = render(
      <Router history={history}>
        <PublicProjectAttachments projectForViewData={getProjectForViewResponse} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('filename.test')).toBeInTheDocument();
    });
  });
});
