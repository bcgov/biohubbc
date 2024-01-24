import { AxiosInstance, CancelTokenSource } from 'axios';
import {
  IObservationRecord,
  IObservationTableRow,
  ISupplementaryObservationData
} from 'contexts/observationsTableContext';
import { IGetSurveyObservationsResponse } from 'interfaces/useObservationApi.interface';

/**
 * Returns a set of supported api methods for working with observations.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useObservationApi = (axios: AxiosInstance) => {
  /**
   * Insert/updates all survey observation records for the given survey
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {IObservationTableRow[]} surveyObservations
   * @return {*}
   */
  const insertUpdateObservationRecords = async (
    projectId: number,
    surveyId: number,
    surveyObservations: IObservationTableRow[]
  ): Promise<IObservationRecord[]> => {
    const { data } = await axios.put<IGetSurveyObservationsResponse>(
      `/api/project/${projectId}/survey/${surveyId}/observations`,
      { surveyObservations }
    );

    return data.surveyObservations;
  };

  /**
   * Retrieves all survey observation records for the given survey
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<IObservationTableRow[]>}
   */
  const getObservationRecords = async (
    projectId: number,
    surveyId: number,
    pagination?: { page: number, limit: number }
  ): Promise<IGetSurveyObservationsResponse> => {
    let urlParamsString = '';

    if (pagination) {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      urlParamsString = `?${params.toString()}`;
    }

    const { data } = await axios.get<IGetSurveyObservationsResponse>(
      `/api/project/${projectId}/survey/${surveyId}/observations${urlParamsString}`
    );

    return data;
  };

  /**
   * Uploads an observation CSV for import.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<{ submissionId: number }>}
   */
  const uploadCsvForImport = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<{ submissionId: number }> => {
    const formData = new FormData();

    formData.append('media', file);

    const { data } = await axios.post<{ submissionId: number }>(
      `/api/project/${projectId}/survey/${surveyId}/observations/upload`,
      formData,
      {
        cancelToken: cancelTokenSource?.token,
        onUploadProgress: onProgress
      }
    );

    return data;
  };

  /**
   * Begins processing an uploaded observation CSV for import
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} submissionId
   * @return {*}
   */
  const processCsvSubmission = async (projectId: number, surveyId: number, submissionId: number) => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/observations/process`, {
      observation_submission_id: submissionId
    });

    return data;
  };

  /**
   * Deletes all of the observations having the given ID.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {((string | number)[])} surveyObservationIds
   * @return {*}  {Promise<number>}
   */
  const deleteObservationRecords = async (
    projectId: number,
    surveyId: number,
    surveyObservationIds: (string | number)[]
  ): Promise<{ supplementaryObservationData: ISupplementaryObservationData }> => {
    const { data } = await axios.post<{ supplementaryObservationData: ISupplementaryObservationData }>(
      `/api/project/${projectId}/survey/${surveyId}/observations/delete`,
      { surveyObservationIds }
    );

    return data;
  };

  return {
    insertUpdateObservationRecords,
    getObservationRecords,
    deleteObservationRecords,
    uploadCsvForImport,
    processCsvSubmission
  };
};

export default useObservationApi;
