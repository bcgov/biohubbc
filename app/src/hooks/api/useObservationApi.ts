import { AxiosInstance, CancelTokenSource } from 'axios';
import {
  IGetSubmissionCSVForViewResponse,
  IGetObservationSubmissionResponse,
  IUploadObservationSubmissionResponse
} from 'interfaces/useObservationApi.interface';

/**
 * Returns a set of supported api methods for working with observations.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useObservationApi = (axios: AxiosInstance) => {
  /**
   * Upload survey observation submission.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadObservationSubmission = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<IUploadObservationSubmissionResponse> => {
    const req_message = new FormData();

    req_message.append('media', file);

    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/observation/submission/upload`,
      req_message,
      {
        cancelToken: cancelTokenSource?.token,
        onUploadProgress: onProgress
      }
    );

    return data;
  };

  /**
   * Get observation submission csv data/details by submission id.
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} submissionId
   * @return {*}  {Promise<IGetSubmissionCSVForViewResponse>}
   */
  const getSubmissionCSVForView = async (
    projectId: number,
    surveyId: number,
    submissionId: number
  ): Promise<IGetSubmissionCSVForViewResponse> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/observation/submission/${submissionId}/view`
    );

    return data;
  };

  /**
   * Get observation submission based on survey ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @returns {*} {Promise<IGetObservationSubmissionResponse>}
   */
  const getObservationSubmission = async (
    projectId: number,
    surveyId: number
  ): Promise<IGetObservationSubmissionResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/observation/submission/get`);

    return data;
  };

  /**
   * Delete observation submission based on submission ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} submissionId
   * @returns {*} {Promise<number>}
   */
  const deleteObservationSubmission = async (
    projectId: number,
    surveyId: number,
    submissionId: number
  ): Promise<number> => {
    const { data } = await axios.delete(
      `/api/project/${projectId}/survey/${surveyId}/observation/submission/${submissionId}/delete`
    );

    return data;
  };

  return {
    uploadObservationSubmission,
    getSubmissionCSVForView,
    getObservationSubmission,
    deleteObservationSubmission
  };
};

export default useObservationApi;
