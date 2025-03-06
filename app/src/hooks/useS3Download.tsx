import { AttachmentsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { useContext } from 'react';
import { APIError } from './api/useAxios';

/**
 * Hook for downloading a file from a S3 key.
 *
 */
export const useS3FileDownload = () => {
  const dialogContext = useContext(DialogContext);

  /**
   * Download a file from a S3 key.
   *
   * @param {string} s3KeyOrPromise - The S3 key or a promise that resolves to the S3 key.
   * @returns {*} {Promise<void>}
   */
  const downloadS3File = async (s3KeyOrPromise: Promise<string> | string) => {
    try {
      const s3Key = await s3KeyOrPromise;

      window.open(s3Key);
    } catch (error) {
      const apiError = error as APIError;

      dialogContext.setErrorDialog({
        open: true,
        onOk: () => dialogContext.setErrorDialog({ open: false }),
        onClose: () => dialogContext.setErrorDialog({ open: false }),
        dialogTitle: AttachmentsI18N.downloadErrorTitle,
        dialogText: AttachmentsI18N.downloadErrorText,
        dialogErrorDetails: apiError.errors
      });
    }
  };

  return {
    downloadS3File
  };
};
