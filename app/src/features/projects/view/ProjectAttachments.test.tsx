import {
  cleanup,
  fireEvent,
  getByTestId as rawGetByTestId,
  queryByTestId as rawQueryByTestId,
  render,
  waitFor
} from '@testing-library/react';
import { AttachmentType } from 'constants/attachments';
import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectAttachments from './ProjectAttachments';

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

describe.skip('ProjectAttachments', () => {
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

    expect(getByText('Submit Documents')).toBeInTheDocument();
    expect(queryByText('Upload Attachment')).toBeNull();

    fireEvent.click(getByText('Submit Documents'));

    await waitFor(() => {
      expect(getByText('Submit Attachments')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Submit Attachments'));

    expect(getByText('Close')).toBeInTheDocument();
  });

  it('renders correctly with no attachments', () => {
    const { getByText } = render(
      <Router history={history}>
        <ProjectAttachments projectForViewData={getProjectForViewResponse} />
      </Router>
    );

    expect(getByText('No Documents')).toBeInTheDocument();
  });

  it.skip('renders correctly with attachments', async () => {
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

  it.skip('deletes an attachment from the attachments list as expected', async () => {
    mockBiohubApi().project.deleteProjectAttachment.mockResolvedValue(1);
    mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList: [
        {
          id: 1,
          fileName: 'filename1.test',
          fileType: AttachmentType.OTHER,
          lastModified: '2021-04-09 11:53:53',
          size: 3028
        },
        {
          id: 2,
          fileName: 'filename2.test',
          fileType: AttachmentType.REPORT,
          lastModified: '2021-04-09 11:53:53',
          size: 3028
        }
      ]
    });

    const { baseElement, queryByText, getByTestId, getAllByTestId, queryByTestId } = render(
      <DialogContextProvider>
        <Router history={history}>
          <ProjectAttachments projectForViewData={getProjectForViewResponse} />
        </Router>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(queryByText('filename1.test')).toBeInTheDocument();
      expect(queryByText('filename2.test')).toBeInTheDocument();
    });

    mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList: [
        {
          id: 2,
          fileName: 'filename2.test',
          fileType: AttachmentType.REPORT,
          lastModified: '2021-04-09 11:53:53',
          size: 3028
        }
      ]
    });

    fireEvent.click(getAllByTestId('attachment-action-menu')[0]);

    await waitFor(() => {
      expect(rawQueryByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete')).toBeInTheDocument();
    });

    fireEvent.click(rawGetByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete'));

    await waitFor(() => {
      expect(queryByTestId('yes-no-dialog')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('yes-button'));

    await waitFor(() => {
      expect(queryByText('filename1.test')).not.toBeInTheDocument();
      expect(queryByText('filename2.test')).toBeInTheDocument();
    });
  });

  it.skip('does not delete an attachment from the attachments when user selects no from dialog', async () => {
    mockBiohubApi().project.deleteProjectAttachment.mockResolvedValue(1);
    mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList: [
        {
          id: 1,
          fileName: 'filename.test',
          fileType: AttachmentType.REPORT,
          lastModified: '2021-04-09 11:53:53',
          size: 3028
        }
      ]
    });

    const { baseElement, queryByText, getByTestId, queryByTestId, getAllByTestId } = render(
      <DialogContextProvider>
        <Router history={history}>
          <ProjectAttachments projectForViewData={getProjectForViewResponse} />
        </Router>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });

    mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList: []
    });

    fireEvent.click(getAllByTestId('attachment-action-menu')[0]);

    await waitFor(() => {
      expect(rawQueryByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete')).toBeInTheDocument();
    });

    fireEvent.click(rawGetByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete'));

    await waitFor(() => {
      expect(queryByTestId('yes-no-dialog')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('no-button'));

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });
  });

  it.skip('does not delete an attachment from the attachments when user clicks outside the dialog', async () => {
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

    const { baseElement, queryByText, getAllByRole, queryByTestId, getAllByTestId } = render(
      <DialogContextProvider>
        <Router history={history}>
          <ProjectAttachments projectForViewData={getProjectForViewResponse} />
        </Router>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });

    mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
      attachmentsList: []
    });

    fireEvent.click(getAllByTestId('attachment-action-menu')[0]);

    await waitFor(() => {
      expect(rawQueryByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete')).toBeInTheDocument();
    });

    fireEvent.click(rawGetByTestId(baseElement as HTMLElement, 'attachment-action-menu-delete'));

    await waitFor(() => {
      expect(queryByTestId('yes-no-dialog')).toBeInTheDocument();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    const background = getAllByRole('presentation')[0].firstChild;

    if (!background) {
      fail('Failed to click background.');
    }

    fireEvent.click(background);

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });
  });
});
