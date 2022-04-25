import { fireEvent, render, waitFor } from '@testing-library/react';
import { APIError } from 'hooks/api/useAxios';
import React from 'react';
import FileUploadItem, { IFileUploadItemProps } from './FileUploadItem';

const renderContainer = (props: IFileUploadItemProps) => {
  return render(<FileUploadItem {...props} />);
};

describe('FileUploadItem', () => {
  it('calls props.onCancel when the `X` button is clicked', async () => {
    let rejectRef: (value: unknown) => void;

    const mockUploadPromise = new Promise(function (resolve: any, reject: any) {
      rejectRef = reject;
    });

    const testFile = new File(['test png content'], 'testpng.txt', { type: 'text/plain' });

    const mockUploadHandler = jest.fn();
    const mockOnSuccess = jest.fn();
    const mockOnCancel = jest.fn();

    const { getByText, getByTitle } = renderContainer({
      uploadHandler: mockUploadHandler.mockResolvedValue(mockUploadPromise),
      onSuccess: mockOnSuccess,
      file: testFile,
      error: '',
      onCancel: mockOnCancel
    });

    await waitFor(() => {
      expect(mockUploadHandler).toHaveBeenCalledWith(testFile, expect.any(Object), expect.any(Function));

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
      expect(mockOnSuccess).toHaveBeenCalledTimes(0);

      expect(mockOnCancel).toBeCalledTimes(1);
    });
  });

  it('handles file upload success', async () => {
    let resolveRef: (value: unknown) => void;

    const mockUploadPromise = new Promise(function (resolve: any, reject: any) {
      resolveRef = resolve;
    });

    const testFile = new File(['test png content'], 'testpng.txt', { type: 'text/plain' });

    const mockUploadHandler = jest.fn();
    const mockOnSuccess = jest.fn();
    const mockOnCancel = jest.fn();

    const { getByText } = renderContainer({
      uploadHandler: mockUploadHandler.mockResolvedValue(mockUploadPromise),
      onSuccess: mockOnSuccess,
      file: testFile,
      error: '',
      onCancel: mockOnCancel
    });

    await waitFor(() => {
      expect(mockUploadHandler).toHaveBeenCalledWith(testFile, expect.any(Object), expect.any(Function));

      expect(getByText('testpng.txt')).toBeVisible();

      expect(getByText('Uploading')).toBeVisible();
    });

    // Manually trigger the upload resolve to simulate a successful upload
    // @ts-ignore
    resolveRef(null);

    await waitFor(() => {
      expect(getByText('Complete')).toBeVisible();

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);

      expect(mockOnCancel).toHaveBeenCalledTimes(0);
    });
  });

  it('handles file upload rejection', async () => {
    let rejectRef: (reason: unknown) => void;

    const mockUploadPromise = new Promise(function (resolve: any, reject: any) {
      rejectRef = reject;
    });

    const testFile = new File(['test png content'], 'testpng.txt', { type: 'text/plain' });

    const mockUploadHandler = jest.fn();
    const mockOnSuccess = jest.fn();
    const mockOnCancel = jest.fn();

    const { getByText } = renderContainer({
      uploadHandler: mockUploadHandler.mockResolvedValue(mockUploadPromise),
      onSuccess: mockOnSuccess,
      file: testFile,
      error: '',
      onCancel: mockOnCancel
    });

    await waitFor(() => {
      expect(mockUploadHandler).toHaveBeenCalledWith(testFile, expect.any(Object), expect.any(Function));

      expect(getByText('testpng.txt')).toBeVisible();

      expect(getByText('Uploading')).toBeVisible();
    });

    // Manually trigger the upload reject to simulate an unsuccessful upload
    // @ts-ignore
    rejectRef(new APIError({ response: { data: { message: 'api error message' } } } as any));

    await waitFor(() => {
      expect(getByText('api error message')).toBeVisible();

      expect(mockOnSuccess).toHaveBeenCalledTimes(0);

      expect(mockOnCancel).toHaveBeenCalledTimes(0);
    });
  });

  it('shows an error message if the component initially receives an error', async () => {
    const testFile = new File(['test png content'], 'testpng.txt', { type: 'text/plain' });

    const mockUploadHandler = jest.fn();
    const mockOnSuccess = jest.fn();
    const mockOnCancel = jest.fn();

    const { getByText } = renderContainer({
      uploadHandler: mockUploadHandler,
      onSuccess: mockOnSuccess,
      file: testFile,
      error: 'initial error message',
      onCancel: mockOnCancel
    });

    await waitFor(() => {
      expect(getByText('testpng.txt')).toBeVisible();
      expect(getByText('initial error message')).toBeVisible();
    });
  });
});
