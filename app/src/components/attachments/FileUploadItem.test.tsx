import { fireEvent, render, waitFor } from '@testing-library/react';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import FileUploadItem, { IFileUploadItemProps } from './FileUploadItem';

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
const onCancel = jest.fn();

const renderContainer = (props: IFileUploadItemProps) => {
  return render(<FileUploadItem {...props} />);
};

describe('FileUploadItem', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.uploadProjectAttachments.mockClear();
  });

  it('calls props.onCancel when the `X` button is clicked', async () => {
    let rejectRef: (value: unknown) => void;

    const mockUploadPromise = new Promise(function (resolve: any, reject: any) {
      rejectRef = reject;
    });

    mockBiohubApi().project.uploadProjectAttachments.mockReturnValue(mockUploadPromise);

    const testFile = new File(['test png content'], 'testpng.txt', { type: 'text/plain' });

    const { getByText, getByTitle } = renderContainer({
      projectId,
      file: testFile,
      error: '',
      onCancel: () => onCancel()
    });

    await waitFor(() => {
      expect(mockBiohubApi().project.uploadProjectAttachments).toHaveBeenCalledWith(
        projectId,
        [testFile],
        expect.any(Object),
        expect.any(Function)
      );

      expect(getByText('testpng.txt')).toBeVisible();

      expect(getByText('Uploading')).toBeVisible();
    });

    const cancelButton = getByTitle('Cancel Upload');

    expect(cancelButton).toBeVisible();

    fireEvent.click(cancelButton);

    // Manually trigger the upload reject to simulate a cancelled request
    // @ts-ignore
    rejectRef({ message: '' });

    await waitFor(() => {
      expect(onCancel).toBeCalledTimes(1);
    });
  });

  it('handles file upload success', async () => {
    let resolveRef: (value: unknown) => void;

    const mockUploadPromise = new Promise(function (resolve: any, reject: any) {
      resolveRef = resolve;
    });

    mockBiohubApi().project.uploadProjectAttachments.mockReturnValue(mockUploadPromise);

    const testFile = new File(['test png content'], 'testpng.txt', { type: 'text/plain' });

    const { getByText } = renderContainer({
      projectId,
      file: testFile,
      error: '',
      onCancel: () => onCancel()
    });

    await waitFor(() => {
      expect(mockBiohubApi().project.uploadProjectAttachments).toHaveBeenCalledWith(
        projectId,
        [testFile],
        expect.any(Object),
        expect.any(Function)
      );

      expect(getByText('testpng.txt')).toBeVisible();

      expect(getByText('Uploading')).toBeVisible();
    });

    // Manually trigger the upload resolve to simulate a successful upload
    // @ts-ignore
    resolveRef(null);

    await waitFor(() => {
      expect(getByText('Complete')).toBeVisible();
    });
  });

  it('handles file upload API rejection', async () => {
    let rejectRef: (reason: unknown) => void;

    const mockUploadPromise = new Promise(function (resolve: any, reject: any) {
      rejectRef = reject;
    });

    mockBiohubApi().project.uploadProjectAttachments.mockReturnValue(mockUploadPromise);

    const testFile = new File(['test png content'], 'testpng.txt', { type: 'text/plain' });

    const { getByText } = renderContainer({
      projectId,
      file: testFile,
      error: '',
      onCancel: () => onCancel()
    });

    await waitFor(() => {
      expect(mockBiohubApi().project.uploadProjectAttachments).toHaveBeenCalledWith(
        projectId,
        [testFile],
        expect.any(Object),
        expect.any(Function)
      );

      expect(getByText('testpng.txt')).toBeVisible();

      expect(getByText('Uploading')).toBeVisible();
    });

    // Manually trigger the upload reject to simulate an unsuccessful upload
    // @ts-ignore
    rejectRef(new APIError({ response: { data: { message: 'api error message' } } } as any));

    await waitFor(() => {
      expect(getByText('api error message')).toBeVisible();
    });
  });

  it('shows an error message if the component initially receives an error', async () => {
    const testFile = new File(['test png content'], 'testpng.txt', { type: 'text/plain' });

    const { getByText } = renderContainer({
      projectId,
      file: testFile,
      error: 'initial error message',
      onCancel: () => onCancel()
    });

    await waitFor(() => {
      expect(getByText('testpng.txt')).toBeVisible();
      expect(getByText('initial error message')).toBeVisible();
    });
  });
});
