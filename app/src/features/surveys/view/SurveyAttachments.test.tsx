import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  queryByTestId as rawQueryByTestId,
  getByTestId as rawGetByTestId
} from '@testing-library/react';
import { AttachmentType } from 'constants/attachments';
import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { Route, Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import SurveyAttachments from './SurveyAttachments';

const history = createMemoryHistory({ initialEntries: ['projects/1/surveys/1'] });

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  survey: {
    getSurveyAttachments: jest.fn(),
    deleteSurveyAttachment: jest.fn()
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
    const { getByText, queryByText } = render(
      <Router history={history}>
        <Route path="projects/:id/surveys/:survey_id">
          <SurveyAttachments
            projectForViewData={getProjectForViewResponse}
            surveyForViewData={getSurveyForViewResponse}
          />
        </Route>
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
        <Route path="projects/:id/surveys/:survey_id">
          <SurveyAttachments
            projectForViewData={getProjectForViewResponse}
            surveyForViewData={getSurveyForViewResponse}
          />
        </Route>
      </Router>
    );

    expect(getByText('No Attachments')).toBeInTheDocument();
  });

  it('renders correctly with attachments', async () => {
    mockBiohubApi().survey.getSurveyAttachments.mockResolvedValue({
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
        <Route path="projects/:id/surveys/:survey_id">
          <SurveyAttachments
            projectForViewData={getProjectForViewResponse}
            surveyForViewData={getSurveyForViewResponse}
          />
        </Route>
      </Router>
    );

    await waitFor(() => {
      expect(getByText('filename.test')).toBeInTheDocument();
    });
  });

  it('deletes an attachment from the attachments list as expected', async () => {
    mockBiohubApi().survey.deleteSurveyAttachment.mockResolvedValue(1);
    mockBiohubApi().survey.getSurveyAttachments.mockResolvedValue({
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
          <Route path="projects/:id/surveys/:survey_id">
            <SurveyAttachments
              projectForViewData={getProjectForViewResponse}
              surveyForViewData={getSurveyForViewResponse}
            />
          </Route>
        </Router>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(queryByText('filename1.test')).toBeInTheDocument();
      expect(queryByText('filename2.test')).toBeInTheDocument();
    });

    mockBiohubApi().survey.getSurveyAttachments.mockResolvedValue({
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

  it('does not delete an attachment from the attachments when user selects no from dialog', async () => {
    mockBiohubApi().survey.deleteSurveyAttachment.mockResolvedValue(1);
    mockBiohubApi().survey.getSurveyAttachments.mockResolvedValue({
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
          <Route path="projects/:id/surveys/:survey_id">
            <SurveyAttachments
              projectForViewData={getProjectForViewResponse}
              surveyForViewData={getSurveyForViewResponse}
            />
          </Route>
        </Router>
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
    mockBiohubApi().survey.getSurveyAttachments.mockResolvedValue({
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
          <SurveyAttachments
            projectForViewData={getProjectForViewResponse}
            surveyForViewData={getSurveyForViewResponse}
          />
        </Router>
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
