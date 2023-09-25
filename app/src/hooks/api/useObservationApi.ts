import { AxiosInstance, CancelTokenSource } from 'axios';
import { IObservationTableRow } from 'contexts/observationsContext';
import { GeoJsonProperties } from 'geojson';
import {
  IGetObservationSubmissionResponse,
  ISpatialData,
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
   * Get occurrence information for view-only purposes based on occurrence submission id
   *
   * @param {number} occurrenceSubmissionId
   * @returns {*} {Promise<ISpatialData[]>}
   */
  const getOccurrencesForView = async (projectId: number, occurrenceSubmissionId: number): Promise<ISpatialData[]> => {
    const { data } = await axios.post(`/api/dwc/view-occurrences`, {
      occurrence_submission_id: occurrenceSubmissionId,
      project_id: projectId
    });

    return data;
  };

  const getSpatialMetadata = async <T = GeoJsonProperties>(submissionSpatialComponentIds: number[]): Promise<T[]> => {
    const { data } = await axios.get<T[]>(`/api/dwc/metadata`, {
      params: { submissionSpatialComponentIds: submissionSpatialComponentIds }
    });

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
   * Get observation submission S3 url based on survey and submission ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<string>}
   */
  const getObservationSubmissionSignedURL = async (
    projectId: number,
    surveyId: number,
    submissionId: number
  ): Promise<string> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/observation/submission/${submissionId}/getSignedUrl`
    );

    return data;
  };

  /**
   * Initiate the transformation process for the submitted observation template.
   *
   * @param {number} projectId
   * @param {number} submissionId
   */
  const initiateXLSXSubmissionTransform = async (projectId: number, submissionId: number, surveyId: number) => {
    const { data } = await axios.post(`/api/xlsx/transform`, {
      project_id: projectId,
      occurrence_submission_id: submissionId,
      survey_id: surveyId
    });

    return data;
  };

  /**
   * Processes an xlsx submission : validates, transforms and scrapes occurrences
   *
   * @param {number} projectId
   * @param {number} submissionId
   * @return {*}
   */
  const processOccurrences = async (projectId: number, submissionId: number, surveyId: number) => {
    const { data } = await axios.post(`/api/xlsx/process`, {
      project_id: projectId,
      occurrence_submission_id: submissionId,
      survey_id: surveyId
    });

    return data;
  };

  /**
   * Validates and processes a submitted Darwin Core File
   *
   * @param {number} projectId
   * @param {number} submissionId
   * @return {*}
   */
  const processDWCFile = async (projectId: number, submissionId: number) => {
    const { data } = await axios.post(`api/dwc/process`, {
      project_id: projectId,
      occurrence_submission_id: submissionId
    });

    return data;
  };

  /**
   * TODO
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {IObservationTableRow[]} surveyObservations
   * @return {*} 
   */
  const insertUpdateObservationRecords = async (projectId: number, surveyId: number, surveyObservations: IObservationTableRow[]) => {
    const { data } = await axios.put(
      `/api/project/${projectId}/survey/${surveyId}/observation`,
      { surveyObservations }
    );

    return data;
  }

  const getObservationRecords = async (projectId: number, surveyId: number) => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/observation`);

    return data;
  }

  return {
    uploadObservationSubmission,
    getObservationSubmission,
    deleteObservationSubmission,
    getObservationSubmissionSignedURL,
    initiateXLSXSubmissionTransform,
    getOccurrencesForView,
    processOccurrences,
    processDWCFile,
    getSpatialMetadata,
    insertUpdateObservationRecords,
    getObservationRecords
  };
};

export default useObservationApi;
