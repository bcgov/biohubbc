import { AxiosInstance, CancelTokenSource } from 'axios';
import {
  IGetSubmissionCSVForViewResponse,
  IGetObservationSubmissionResponse
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
  ): Promise<string[]> => {
    const req_message = new FormData();

    req_message.append('media', file);

    //if (file.type === 'application/x-zip-compressed' || 'application/zip' || '.zip') {
    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/observation/submission/upload`,
      req_message,
      {
        cancelToken: cancelTokenSource?.token,
        onUploadProgress: onProgress
      }
    );

    if (data.submissionId) {
      if (file.type === 'application/x-zip-compressed' || file.type === 'application/zip') {
        initiateObservationSubmissionValidation(data.submissionId);
      } else {
        initiateXLXvalidation(data.submissionId);
      }
    }

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
   * Initiate the validation process for the submitted observations
   * @param {number} submissionId
   */
  const initiateObservationSubmissionValidation = async (submissionId: number) => {
    axios.post(`/api/dwc/validate`, {
      occurrence_submission_id: submissionId
    });
  };

  const initiateXLXvalidation = async (submissionId: number) => {
    axios.post(`/api/xlsx/validate`, {
      occurrence_submission_id: submissionId
    });
  };

  return {
    uploadObservationSubmission,
    getSubmissionCSVForView,
    getObservationSubmission
  };
};

export default useObservationApi;
