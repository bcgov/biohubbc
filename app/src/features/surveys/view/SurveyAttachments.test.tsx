import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { MemoryRouter, Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
import SurveyAttachments from './SurveyAttachments';

const history = createMemoryHistory();

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
        <SurveyAttachments
          projectForViewData={getProjectForViewResponse}
          surveyForViewData={getSurveyForViewResponse}
        />
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
        <SurveyAttachments
          projectForViewData={getProjectForViewResponse}
          surveyForViewData={getSurveyForViewResponse}
        />
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
        <SurveyAttachments
          projectForViewData={getProjectForViewResponse}
          surveyForViewData={getSurveyForViewResponse}
        />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('filename.test')).toBeInTheDocument();
    });
  });

  it('does not delete an attachment from the attachments when user selects no from dialog', async () => {
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

    const { queryByText, getByTestId, getByText } = render(
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

    fireEvent.click(getByTestId('delete-attachment'));

    await waitFor(() => {
      expect(queryByText('Delete Attachment')).toBeInTheDocument();
    });

    fireEvent.click(getByText('No'));

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

    const { queryByText, getByTestId, getAllByRole } = render(
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

    fireEvent.click(getByTestId('delete-attachment'));

    await waitFor(() => {
      expect(queryByText('Delete Attachment')).toBeInTheDocument();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    //@ts-ignore
    fireEvent.click(getAllByRole('presentation')[0].firstChild);

    await waitFor(() => {
      expect(queryByText('filename.test')).toBeInTheDocument();
    });
  });
});
