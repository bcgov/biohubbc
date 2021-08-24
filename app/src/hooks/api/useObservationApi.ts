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

    if (data.submissionId) {
      // Initiate the appropriate validation process for the submitted observations
      if (file.type === 'application/x-zip-compressed' || file.type === 'application/zip') {
        await axios.get('http://10.0.0.42:5678/webhook-test/11eeb63d-18fe-43fa-963d-8acd54184a7e', {
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        });
        // await axios.get('http://localhost:6100/api/version');
        // await axios.get('https://swapi.dev/api/people/1');
      } else {
        initiateXLSXSubmissionValidation(data.submissionId);
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

  /**
   * Initiate the validation process for the submitted observations
   * @param {number} submissionId
   */
  // const initiateDwCSubmissionValidation = async (submissionId: number) => {
  //   axios.post(`/api/dwc/validate`, {
  //     occurrence_submission_id: submissionId
  //   });
  // };

  const initiateXLSXSubmissionValidation = async (submissionId: number) => {
    axios.post(`/api/xlsx/validate`, {
      occurrence_submission_id: submissionId
    });
  };

  return {
    uploadObservationSubmission,
    getSubmissionCSVForView,
    getObservationSubmission,
    deleteObservationSubmission
  };
};

export default useObservationApi;
