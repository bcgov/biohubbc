import { AxiosInstance, CancelTokenSource } from 'axios';

/**
 * Returns a set of supported api methods for working with darwin core related features.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useDwcApi = (axios: AxiosInstance) => {
  /**
   * Validate uploaded dwc attachments.
   *
   * @param {File[]} files
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const validateDwcAttachments = async (
    files: File[],
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<string[]> => {
    const req_message = new FormData();

    files.forEach((file) => req_message.append('media', file));

    const { data } = await axios.post(`/api/dwc/validate`, req_message, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };

  return { validateDwcAttachments };
};

export default useDwcApi;
