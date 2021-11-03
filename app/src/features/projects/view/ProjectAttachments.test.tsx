import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
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

    fireEvent.click(getByText('Upload Attachments'));

    await waitFor(() => {
      expect(queryByText('Upload Attachments')).toBeNull();
    });

    expect(getByText('Close')).toBeInTheDocument();
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

  // it('deletes an attachment from the attachments list as expected', async () => {
  //   mockBiohubApi().project.deleteProjectAttachment.mockResolvedValue(1);
  //   mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
  //     attachmentsList: [
  //       {
  //         id: 1,
  //         fileName: 'filename1.test',
  //         lastModified: '2021-04-09 11:53:53',
  //         size: 3028
  //       },
  //       {
  //         id: 2,
  //         fileName: 'filename2.test',
  //         lastModified: '2021-04-09 11:53:53',
  //         size: 3028
  //       }
  //     ]
  //   });

  //   const { queryByText, getByTestId, getAllByRole } = render(
  //     <DialogContextProvider>
  //       <Router history={history}>
  //         <ProjectAttachments projectForViewData={getProjectForViewResponse} />
  //       </Router>
  //     </DialogContextProvider>
  //   );

  //   await waitFor(() => {
  //     expect(queryByText('filename1.test')).toBeInTheDocument();
  //     expect(queryByText('filename2.test')).toBeInTheDocument();
  //   });

  //   mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
  //     attachmentsList: []
  //   });

  //   fireEvent.click(getByTestId('click-ellipsis'));

  //   fireEvent.mouseDown(
  //     getByTestId('click-ellipsis'),
  //     fireEvent.change(getByTestId('click-ellipsis'), { target: { value: 'delete-file' } })
  //   );

  //   // Get the backdrop, then get the firstChild because this is where the event listener is attached
  // //@ts-ignore
  //   fireEvent.click(getAllByRole('dialog'));

  //   await waitFor(() => {
  //     expect(queryByText('Delete Attachment')).toBeInTheDocument();
  //   });

  //   fireEvent.click(getByTestId('yes-button'));

  //   await waitFor(() => {
  //     expect(getByTestId('click-ellipsis')).not.toBeInTheDocument();
  //     expect(queryByText('filename2.test')).not.toBeInTheDocument();
  //   });
  // });

  // it('does not delete an attachment from the attachments when user selects no from dialog', async () => {
  //   mockBiohubApi().project.deleteProjectAttachment.mockResolvedValue(1);
  //   mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
  //     attachmentsList: [
  //       {
  //         id: 1,
  //         fileName: 'filename.test',
  //         lastModified: '2021-04-09 11:53:53',
  //         size: 3028
  //       }
  //     ]
  //   });

  //   const { queryByText, getByTestId, getByText } = render(
  //     <DialogContextProvider>
  //       <Router history={history}>
  //         <ProjectAttachments projectForViewData={getProjectForViewResponse} />
  //       </Router>
  //     </DialogContextProvider>
  //   );

  //   await waitFor(() => {
  //     expect(queryByText('filename.test')).toBeInTheDocument();
  //   });

  //   mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
  //     attachmentsList: []
  //   });

  //   fireEvent.click(getByTestId('click-ellipsis'));

  //   fireEvent.click(getByTestId('delete-attachment'));

  //   await waitFor(() => {
  //     expect(queryByText('Delete File')).toBeInTheDocument();
  //   });

  //   fireEvent.click(getByText('No'));

  //   await waitFor(() => {
  //     expect(queryByText('filename.test')).toBeInTheDocument();
  //   });
  // });

  // it('does not delete an attachment from the attachments when user clicks outside the dialog', async () => {
  //   mockBiohubApi().project.deleteProjectAttachment.mockResolvedValue(1);
  //   mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
  //     attachmentsList: [
  //       {
  //         id: 1,
  //         fileName: 'filename.test',
  //         lastModified: '2021-04-09 11:53:53',
  //         size: 3028
  //       }
  //     ]
  //   });

  //   const { queryByText, getByTestId, getAllByRole } = render(
  //     <DialogContextProvider>
  //       <Router history={history}>
  //         <ProjectAttachments projectForViewData={getProjectForViewResponse} />
  //       </Router>
  //     </DialogContextProvider>
  //   );

  //   await waitFor(() => {
  //     expect(queryByText('filename.test')).toBeInTheDocument();
  //   });

  //   mockBiohubApi().project.getProjectAttachments.mockResolvedValue({
  //     attachmentsList: []
  //   });

  //   fireEvent.click(getByTestId('delete-attachment'));

  //   await waitFor(() => {
  //     expect(queryByText('Delete Attachment')).toBeInTheDocument();
  //   });

  //   // Get the backdrop, then get the firstChild because this is where the event listener is attached
  //   //@ts-ignore
  //   fireEvent.click(getAllByRole('presentation')[0].firstChild);

  //   await waitFor(() => {
  //     expect(queryByText('filename.test')).toBeInTheDocument();
  //   });
  // });
});
