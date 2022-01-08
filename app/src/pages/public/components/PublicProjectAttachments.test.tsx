import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React from 'react';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicProjectAttachments from './PublicProjectAttachments';

const history = createMemoryHistory();
jest.mock('../../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  public: {
    project: {
      getProjectAttachments: jest.fn()
    }
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

describe('PublicProjectAttachments', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().public.project.getProjectAttachments.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no attachments', async () => {
    mockRestorationTrackerApi().public.project.getProjectAttachments.mockResolvedValue({
      attachmentsList: []
    });

    const { getByText } = render(
      <Router history={history}>
        <PublicProjectAttachments projectForViewData={getProjectForViewResponse} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('No Attachments')).toBeInTheDocument();
    });
  });

  it('renders correctly with attachments', async () => {
    mockRestorationTrackerApi().public.project.getProjectAttachments.mockResolvedValue({
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
