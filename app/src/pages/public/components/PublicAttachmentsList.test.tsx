import { fireEvent, render, cleanup, waitFor, getByText as rawGetByText } from '@testing-library/react';
import React from 'react';
import PublicAttachmentsList from './PublicAttachmentsList';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { AttachmentType } from '../../../constants/attachments';

jest.mock('../../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  public: {
    project: {
      getAttachmentSignedURL: jest.fn(),
      getPublicProjectReportMetadata: jest.fn(() =>
        Promise.resolve({
          attachment_id: 1,
          title: 'Title of my report',
          year_published: '2000',
          description: 'my abstract',
          last_modified: '2020-10-10',
          revision_count: 1,
          authors: [
            {
              first_name: 'John',
              last_name: 'Smith'
            }
          ]
        })
      )
    }
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

describe('PublicAttachmentsList', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().public.project.getAttachmentSignedURL.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  const attachmentsList = [
    {
      id: 1,
      fileName: 'filename.test',
      fileType: 'Other',
      lastModified: '2021-04-09 11:53:53',
      size: 3028,
      securityToken: true,
      revisionCount: 1
    },
    {
      id: 20,
      fileName: 'filename20.test',
      fileType: AttachmentType.REPORT,
      lastModified: '2021-04-09 11:53:53',
      size: 30280000,
      securityToken: true,
      revisionCount: 1
    },
    {
      id: 30,
      fileName: 'filename30.test',
      fileType: 'Other',
      lastModified: '2021-04-09 11:53:53',
      size: 30280000000,
      securityToken: false,
      revisionCount: 1
    }
  ];

  it('renders correctly with no attachments', () => {
    const { getByText } = render(
      <PublicAttachmentsList projectId={1} attachmentsList={[]} getAttachments={jest.fn()} />
    );

    expect(getByText('No Attachments')).toBeInTheDocument();
  });

  it('viewing file contents in new tab works as expected for project attachments that are unsecure', async () => {
    window.open = jest.fn();

    const signedUrl = 'www.signedurl.com';

    mockRestorationTrackerApi().public.project.getAttachmentSignedURL.mockResolvedValue(signedUrl);

    const { getByText } = render(
      <PublicAttachmentsList projectId={1} attachmentsList={attachmentsList} getAttachments={jest.fn()} />
    );

    expect(getByText('filename30.test')).toBeInTheDocument();

    fireEvent.click(getByText('filename30.test'));

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(signedUrl);
    });
  });

  it('viewing file contents in new tab does not work for project attachments that are secure', async () => {
    window.open = jest.fn();

    const { getByText } = render(
      <PublicAttachmentsList projectId={1} attachmentsList={attachmentsList} getAttachments={jest.fn()} />
    );

    expect(getByText('filename.test')).toBeInTheDocument();

    fireEvent.click(getByText('filename.test'));

    await waitFor(() => {
      expect(window.open).not.toHaveBeenCalled();
    });
  });

  it('renders correctly with attachments (of various sizes)', async () => {
    const { getByText } = render(
      <PublicAttachmentsList projectId={1} attachmentsList={attachmentsList} getAttachments={jest.fn()} />
    );

    expect(getByText('filename.test')).toBeInTheDocument();
    expect(getByText('filename20.test')).toBeInTheDocument();
    expect(getByText('filename30.test')).toBeInTheDocument();
  });

  it('changing pages displays the correct rows as expected', () => {
    const largeAttachmentsList = [
      { ...attachmentsList[0] },
      {
        ...attachmentsList[0],
        id: 2,
        fileName: 'filename2.test'
      },
      {
        ...attachmentsList[0],
        id: 3,
        fileName: 'filename3.test'
      },
      {
        ...attachmentsList[0],
        id: 4,
        fileName: 'filename4.test'
      },
      {
        ...attachmentsList[0],
        id: 5,
        fileName: 'filename5.test'
      },
      {
        ...attachmentsList[0],
        id: 6,
        fileName: 'filename6.test'
      },
      {
        ...attachmentsList[0],
        id: 7,
        fileName: 'filename7.test'
      },
      {
        ...attachmentsList[0],
        id: 8,
        fileName: 'filename8.test'
      },
      {
        ...attachmentsList[0],
        id: 9,
        fileName: 'filename9.test'
      },
      {
        ...attachmentsList[0],
        id: 10,
        fileName: 'filename10.test'
      },
      {
        ...attachmentsList[0],
        id: 11,
        fileName: 'filename11.test'
      }
    ];

    const { getByText, queryByText, getByLabelText } = render(
      <PublicAttachmentsList projectId={1} attachmentsList={largeAttachmentsList} getAttachments={jest.fn()} />
    );

    expect(getByText('filename.test')).toBeInTheDocument();
    expect(getByText('filename2.test')).toBeInTheDocument();
    expect(getByText('filename3.test')).toBeInTheDocument();
    expect(getByText('filename4.test')).toBeInTheDocument();
    expect(getByText('filename5.test')).toBeInTheDocument();
    expect(getByText('filename6.test')).toBeInTheDocument();
    expect(getByText('filename7.test')).toBeInTheDocument();
    expect(getByText('filename8.test')).toBeInTheDocument();
    expect(getByText('filename9.test')).toBeInTheDocument();
    expect(getByText('filename10.test')).toBeInTheDocument();
    expect(queryByText('filename11.test')).toBeNull();

    fireEvent.click(getByLabelText('Next page'));

    expect(getByText('filename11.test')).toBeInTheDocument();
    expect(queryByText('filename10.test')).toBeNull();
  });

  it('viewing reportMetadata in dialog works as expected for project attachments', async () => {
    const renderContainer = () => {
      return render(
        <PublicAttachmentsList projectId={1} attachmentsList={attachmentsList} getAttachments={jest.fn()} />
      );
    };

    const { getByText, getByTestId, baseElement } = renderContainer();

    expect(getByText('filename.test')).toBeInTheDocument();

    fireEvent.click(getByTestId('attachment-view-meta'));

    await waitFor(() => {
      expect(mockRestorationTrackerApi().public.project.getPublicProjectReportMetadata).toHaveBeenCalledTimes(1);
      expect(mockRestorationTrackerApi().public.project.getPublicProjectReportMetadata()).resolves.toEqual({
        attachment_id: 1,
        title: 'Title of my report',
        year_published: '2000',
        description: 'my abstract',
        last_modified: '2020-10-10',
        revision_count: 1,
        authors: [
          {
            first_name: 'John',
            last_name: 'Smith'
          }
        ]
      });
    });

    await waitFor(() => {
      expect(getByTestId('view-meta-dialog')).toBeVisible();
      expect(getByTestId('view-meta-dialog-title')).toBeVisible();
    });

    expect(rawGetByText(baseElement as HTMLElement, 'Title of my report')).toBeInTheDocument();
  });
});
