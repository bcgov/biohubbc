import { fireEvent, render, waitFor } from '@testing-library/react';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import FileUpload from './FileUpload';

jest.mock('../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    uploadProjectAttachments: jest.fn<Promise<any>, []>()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const projectId = 1;

const renderContainer = () => {
  return render(<FileUpload projectId={projectId} />);
};

describe('FileUpload', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.uploadProjectArtifacts.mockClear();
  });

  it('matches the snapshot', () => {
    const { asFragment } = renderContainer();

    expect(asFragment()).toMatchSnapshot();
  });

  it('handles file upload success', async () => {
    let resolveRef: (value: unknown) => void;

    const mockUploadPromise = new Promise(function (resolve: any, reject: any) {
      resolveRef = resolve;
    });

    mockBiohubApi().project.uploadProjectAttachments.mockReturnValue(mockUploadPromise);

    const { asFragment, getByTestId, getByText } = renderContainer();

    const testFile = new File(['test png content'], 'testpng.txt', { type: 'text/plain' });

    const dropZoneInput = getByTestId('drop-zone-input');

    fireEvent.change(dropZoneInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(mockBiohubApi().project.uploadProjectAttachments).toHaveBeenCalledWith(
        projectId,
        [testFile],
        expect.any(Object),
        expect.any(Function)
      );

      expect(getByText('testpng.txt')).toBeVisible();

      expect(getByText('uploading')).toBeVisible();
    });

    // Manually trigger the upload resolve to simulate a successful upload
    // @ts-ignore
    resolveRef(null);

    await waitFor(() => {
      expect(getByText('complete')).toBeVisible();
    });

    // expect file list item to show complete state
    expect(asFragment()).toMatchSnapshot();
  });

  it('handles file upload failure', async () => {
    let rejectRef: (reason: unknown) => void;

    const mockUploadPromise = new Promise(function (resolve: any, reject: any) {
      rejectRef = reject;
    });

    mockBiohubApi().project.uploadProjectAttachments.mockReturnValue(mockUploadPromise);

    const { asFragment, getByTestId, getByText, getByTitle } = renderContainer();

    const testFile = new File(['test png content'], 'testpng.txt', { type: 'text/plain' });

    const dropZoneInput = getByTestId('drop-zone-input');

    fireEvent.change(dropZoneInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(mockBiohubApi().project.uploadProjectAttachments).toHaveBeenCalledWith(
        projectId,
        [testFile],
        expect.any(Object),
        expect.any(Function)
      );

      expect(getByText('testpng.txt')).toBeVisible();

      expect(getByText('uploading')).toBeVisible();
    });

    // Manually trigger the upload reject to simulate an unsuccessful upload
    // @ts-ignore
    rejectRef(new APIError({ response: { data: { message: 'File was evil!' } } } as any));

    await waitFor(() => {
      expect(getByText('File was evil!')).toBeVisible();
    });

    // expect file list item to show error state
    expect(asFragment()).toMatchSnapshot();

    const removeButton = getByTitle('Remove File');

    await waitFor(() => {
      expect(removeButton).toBeVisible();
    });

    fireEvent.click(removeButton);

    // expect file list item to be removed
    expect(asFragment()).toMatchSnapshot();
  });
});
