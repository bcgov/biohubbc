import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectAttachments from './ProjectAttachments';
import { useBiohubApi } from 'hooks/useBioHubApi';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectAttachments: jest.fn(),
    deleteProjectAttachment: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('ProjectAttachments', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getProjectAttachments.mockClear();
    mockBiohubApi().project.deleteProjectAttachment.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('correctly opens and closes the file upload dialog', async () => {
    const { getByText, queryByText } = render(
      <Router history={history}>
        <ProjectAttachments projectForViewData={getProjectForViewResponse} />
      </Router>
    );

    expect(getByText('Upload')).toBeInTheDocument();
    expect(queryByText('Upload Attachments')).toBeNull();

    fireEvent.click(getByText('Upload'));

    await waitFor(() => {
      expect(getByText('Upload Attachments')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Close'));

    await waitFor(() => {
      expect(queryByText('Upload Attachments')).toBeNull();
    });
  });

  it('renders correctly with no attachments', () => {
    const { getByText } = render(
      <Router history={history}>
        <ProjectAttachments projectForViewData={getProjectForViewResponse} />
      </Router>
    );

    expect(getByText('No Attachments')).toBeInTheDocument();
  });

  it('renders correctly with attachments', async () => {
    mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
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
        <ProjectAttachments projectForViewData={getProjectForViewResponse} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('filename.test')).toBeInTheDocument();
    });
  });

  it('deletes an attachment from the attachments list as expected', async () => {
    mockBiohubApi().project.deleteProjectAttachment.mockResolvedValue(1);
    mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList: [
        {
          id: 1,
          fileName: 'filename.test',
          lastModified: '2021-04-09 11:53:53',
          size: 3028
        }
      ]
    });

    const { queryByText, getByTestId } = render(
      <Router history={history}>
        <ProjectAttachments projectForViewData={getProjectForViewResponse} />
      </Router>
    );

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });

    mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList: []
    });

    fireEvent.click(getByTestId('delete-attachment'));

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeNull();
    });
  });
});
