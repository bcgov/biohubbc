import { cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import React from 'react';
import { AttachmentType } from '../../../constants/attachments';
import AttachmentsList from './AttachmentsList';

describe('AttachmentsList', () => {
  beforeEach(() => {
    // clear mocks before each test
  });

  afterEach(() => {
    cleanup();
  });

  const attachmentsList: IGetSurveyAttachment[] = [
    {
      id: 1,
      fileName: 'filename.test',
      fileType: AttachmentType.OTHER,
      lastModified: '2021-04-09 11:53:53',
      size: 3028,
      revisionCount: 1,
      supplementaryAttachmentData: null
    },
    {
      id: 20,
      fileName: 'filename20.test',
      fileType: AttachmentType.REPORT,
      lastModified: '2021-04-09 11:53:53',
      size: 30280000,
      revisionCount: 1,
      supplementaryAttachmentData: null
    },
    {
      id: 30,
      fileName: 'filename30.test',
      fileType: AttachmentType.OTHER,
      lastModified: '2021-04-09 11:53:53',
      size: 30280000000,
      revisionCount: 1,
      supplementaryAttachmentData: null
    }
  ];

  it('renders correctly with no Documents', () => {
    const { getByText } = render(
      <AttachmentsList
        attachments={[]}
        handleDownload={jest.fn()}
        handleDelete={jest.fn()}
        handleViewDetails={jest.fn()}
      />
    );

    expect(getByText('No Documents')).toBeInTheDocument();
  });

  it('renders correctly with attachments (of various sizes)', async () => {
    const { getByText } = render(
      <AttachmentsList
        attachments={attachmentsList}
        handleDownload={jest.fn()}
        handleDelete={jest.fn()}
        handleViewDetails={jest.fn()}
      />
    );

    expect(getByText('filename.test')).toBeInTheDocument();
    expect(getByText('filename20.test')).toBeInTheDocument();
    expect(getByText('filename30.test')).toBeInTheDocument();
  });

  it('viewing file contents in new tab works as expected for project attachments', async () => {
    window.open = jest.fn();

    const handleDownload = jest.fn();
    const { getByText } = render(
      <AttachmentsList
        attachments={attachmentsList}
        handleDownload={handleDownload}
        handleDelete={jest.fn()}
        handleViewDetails={jest.fn()}
      />
    );

    expect(getByText('filename.test')).toBeInTheDocument();

    fireEvent.click(getByText('filename.test'));

    await waitFor(() => {
      expect(handleDownload).toHaveBeenCalledTimes(1);
    });
  });

  it('viewing file contents in new tab works as expected for survey attachments', async () => {
    window.open = jest.fn();
    const handleDownload = jest.fn();
    const { getByText } = render(
      <AttachmentsList
        attachments={attachmentsList}
        handleDownload={handleDownload}
        handleDelete={jest.fn()}
        handleViewDetails={jest.fn()}
      />
    );

    expect(getByText('filename.test')).toBeInTheDocument();

    fireEvent.click(getByText('filename.test'));

    await waitFor(() => {
      expect(handleDownload).toHaveBeenCalledTimes(1);
    });
  });
});
