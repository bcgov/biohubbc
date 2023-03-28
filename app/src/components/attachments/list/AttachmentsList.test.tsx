import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { AttachmentType } from '../../../constants/attachments';
import AttachmentsList from './AttachmentsList';

jest.mock('../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getAttachmentSignedURL: jest.fn()
  },
  survey: {
    getSurveyAttachmentSignedURL: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe.skip('AttachmentsList', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.getAttachmentSignedURL.mockClear();
    mockBiohubApi().survey.getSurveyAttachmentSignedURL.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  const attachmentsList = [
    {
      id: 1,
      fileName: 'filename.test',
      fileType: AttachmentType.OTHER,
      lastModified: '2021-04-09 11:53:53',
      size: 3028,
      revisionCount: 1
    },
    {
      id: 20,
      fileName: 'filename20.test',
      fileType: AttachmentType.REPORT,
      lastModified: '2021-04-09 11:53:53',
      size: 30280000,
      revisionCount: 1
    },
    {
      id: 30,
      fileName: 'filename30.test',
      fileType: AttachmentType.OTHER,
      lastModified: '2021-04-09 11:53:53',
      size: 30280000000,
      revisionCount: 1
    }
  ];

  it('renders correctly with no Documents', () => {
    const { getByText } = render(<AttachmentsList projectId={1} attachmentsList={[]} getAttachments={jest.fn()} />);

    expect(getByText('No Documents')).toBeInTheDocument();
  });

  it.skip('renders correctly with attachments (of various sizes)', async () => {
    const { getByText } = render(
      <AttachmentsList projectId={1} attachmentsList={attachmentsList} getAttachments={jest.fn()} />
    );

    expect(getByText('filename.test')).toBeInTheDocument();
    expect(getByText('filename20.test')).toBeInTheDocument();
    expect(getByText('filename30.test')).toBeInTheDocument();
  });

  it('viewing file contents in new tab works as expected for project attachments', async () => {
    window.open = jest.fn();

    const signedUrl = 'www.signedurl.com';

    mockBiohubApi().project.getAttachmentSignedURL.mockResolvedValue(signedUrl);

    const { getByText } = render(
      <AttachmentsList projectId={1} attachmentsList={attachmentsList} getAttachments={jest.fn()} />
    );

    expect(getByText('filename.test')).toBeInTheDocument();

    fireEvent.click(getByText('filename.test'));

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(signedUrl);
    });
  });

  it('viewing file contents in new tab works as expected for survey attachments', async () => {
    window.open = jest.fn();

    const signedUrl = 'www.signedurl.com';

    mockBiohubApi().survey.getSurveyAttachmentSignedURL.mockResolvedValue(signedUrl);

    const { getByText } = render(
      <AttachmentsList projectId={1} surveyId={32} attachmentsList={attachmentsList} getAttachments={jest.fn()} />
    );

    expect(getByText('filename.test')).toBeInTheDocument();

    fireEvent.click(getByText('filename.test'));

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(signedUrl);
    });
  });
});
