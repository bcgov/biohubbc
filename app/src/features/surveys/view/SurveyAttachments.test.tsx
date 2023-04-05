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
import { ISurveyContext, SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import React from 'react';
import SurveyAttachments from './SurveyAttachments';

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  survey: {
    getSurveyForView: jest.fn(),
    getSurveySummarySubmission: jest.fn(),
    getSurveyAttachments: jest.fn(),
    deleteSurveyAttachment: jest.fn()
  },
  observation: {
    getObservationSubmission: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('SurveyAttachments', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().survey.getSurveyAttachments.mockClear();
    mockBiohubApi().survey.deleteSurveyAttachment.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('correctly opens and closes the file upload dialog', async () => {
    const mockSurveyContext: ISurveyContext = ({
      artifactDataLoader: ({
        data: null,
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown) as ISurveyContext;

    const { getByText, queryByText } = render(
      <SurveyContext.Provider value={mockSurveyContext}>
        <SurveyAttachments />
      </SurveyContext.Provider>
    );
    await waitFor(() => {
      expect(getByText('Upload')).toBeInTheDocument();
      expect(queryByText('Upload Attachments')).toBeNull();
    });

    fireEvent.click(getByText('Upload'));

    await waitFor(() => {
      expect(getByText('Upload Attachments')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Upload Attachments'));

    await waitFor(() => {
      expect(getByText('Close')).toBeInTheDocument();
    });
  });

  it('renders correctly with no attachments', async () => {
    const mockSurveyContext: ISurveyContext = ({
      artifactDataLoader: ({
        data: null,
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown) as ISurveyContext;

    const { getByText } = render(
      <SurveyContext.Provider value={mockSurveyContext}>
        <SurveyAttachments />
      </SurveyContext.Provider>
    );
    await waitFor(() => {
      expect(getByText('No Documents')).toBeInTheDocument();
    });
  });

  it('renders correctly with attachments', async () => {
    const mockSurveyContext: ISurveyContext = ({
      artifactDataLoader: ({
        data: {
          attachmentsList: [
            {
              id: 1,
              fileName: 'filename.test',
              lastModified: '2021-04-09 11:53:53',
              size: 3028
            }
          ]
        },
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown) as ISurveyContext;

    mockBiohubApi().survey.getSurveyAttachments.mockResolvedValue({});

    const { getByText } = render(
      <SurveyContext.Provider value={mockSurveyContext}>
        <SurveyAttachments />
      </SurveyContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('filename.test')).toBeInTheDocument();
    });
  });

  it('deletes an attachment from the attachments list as expected', async () => {
    mockBiohubApi().survey.deleteSurveyAttachment.mockResolvedValue(1);

    const mockSurveyContext: ISurveyContext = ({
      artifactDataLoader: ({
        data: {
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
        },
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown) as ISurveyContext;

    const { baseElement, queryByText, getByTestId, getAllByTestId, queryByTestId } = render(
      <DialogContextProvider>
        <SurveyContext.Provider value={mockSurveyContext}>
          <SurveyAttachments />
        </SurveyContext.Provider>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(queryByText('filename1.test')).toBeInTheDocument();
      expect(queryByText('filename2.test')).toBeInTheDocument();
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

    mockSurveyContext.artifactDataLoader.data?.attachmentsList.splice(0, 1);

    await waitFor(() => {
      expect(queryByText('filename1.test')).not.toBeInTheDocument();
      expect(queryByText('filename2.test')).toBeInTheDocument();
    });
  });

  it('does not delete an attachment from the attachments when user selects no from dialog', async () => {
    mockBiohubApi().survey.deleteSurveyAttachment.mockResolvedValue(1);

    const mockSurveyContext: ISurveyContext = ({
      artifactDataLoader: ({
        data: {
          attachmentsList: [
            {
              id: 1,
              fileName: 'filename.test',
              fileType: AttachmentType.REPORT,
              lastModified: '2021-04-09 11:53:53',
              size: 3028
            }
          ]
        },
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown) as ISurveyContext;

    const { baseElement, queryByText, getByTestId, queryByTestId, getAllByTestId } = render(
      <DialogContextProvider>
        <SurveyContext.Provider value={mockSurveyContext}>
          <SurveyAttachments />
        </SurveyContext.Provider>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });

    mockBiohubApi().survey.getSurveyAttachments.mockResolvedValue({
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

  it('does not delete an attachment from the attachments when user clicks outside the dialog', async () => {
    mockBiohubApi().survey.deleteSurveyAttachment.mockResolvedValue(1);
    const mockSurveyContext: ISurveyContext = ({
      artifactDataLoader: ({
        data: {
          attachmentsList: [
            {
              id: 1,
              fileName: 'filename.test',
              fileType: AttachmentType.REPORT,
              lastModified: '2021-04-09 11:53:53',
              size: 3028
            }
          ]
        },
        load: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown) as ISurveyContext;

    const { baseElement, queryByText, getAllByRole, queryByTestId, getAllByTestId } = render(
      <DialogContextProvider>
        <SurveyContext.Provider value={mockSurveyContext}>
          <SurveyAttachments />
        </SurveyContext.Provider>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });

    mockBiohubApi().survey.getSurveyAttachments.mockResolvedValue({
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
