import { AxiosInstance, CancelTokenSource } from 'axios';
import {
  IObservationRecord,
  IStandardObservationColumns,
  ISupplementaryObservationData
} from 'contexts/observationsTableContext';
import {
  IGetSurveyObservationsGeometryResponse,
  IGetSurveyObservationsResponse
} from 'interfaces/useObservationApi.interface';
import { ApiPaginationOptions } from 'types/misc';

export interface MeasurementColumnToSave {
  id: string;
  field: string;
  value: string | number;
}

export interface IObservationTableRowToSave {
  standardColumns: IStandardObservationColumns;
  measurementColumns: MeasurementColumnToSave[];
}

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
   * @param {IObservationTableRowToSave[]} surveyObservations
   * @return {*}  {Promise<IObservationRecord[]>}
   */
  const insertUpdateObservationRecords = async (
    projectId: number,
    surveyId: number,
    surveyObservations: IObservationTableRowToSave[]
  ): Promise<IObservationRecord[]> => {
    // TODO `IObservationRecord[]` might not be the actual return value once measurements are being returned
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
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<IObservationTableRow[]>}
   */
  const getObservationRecords = async (
    projectId: number,
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<IGetSurveyObservationsResponse> => {
    let urlParamsString = '';

    if (pagination) {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (pagination.sort) {
        params.append('sort', pagination.sort);
      }
      if (pagination.order) {
        params.append('order', pagination.order);
      }
      urlParamsString = `?${params.toString()}`;
    }

    const { data } = await axios.get<IGetSurveyObservationsResponse>(
      `/api/project/${projectId}/survey/${surveyId}/observations${urlParamsString}`
    );

    return data;
  };

  /**
   * Retrieves all survey observation records for the given survey
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<IObservationTableRow[]>}
   */
  const getObservationRecord = async (
    projectId: number,
    surveyId: number,
    surveyObservationId: number
  ): Promise<IObservationRecord> => {
    const { data } = await axios.get<IObservationRecord>(
      `/api/project/${projectId}/survey/${surveyId}/observations/${surveyObservationId}`
    );

    return data;
  };

  /**
   * Fetches all geojson geometry points for all observation records belonging to
   * the given survey.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<IGetSurveyObservationsGeometryResponse>}
   */
  const getObservationsGeometry = async (
    projectId: number,
    surveyId: number
  ): Promise<IGetSurveyObservationsGeometryResponse> => {
    const { data } = await axios.get<IGetSurveyObservationsGeometryResponse>(
      `/api/project/${projectId}/survey/${surveyId}/observations/spatial`
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
    getObservationRecord,
    getObservationsGeometry,
    deleteObservationRecords,
    uploadCsvForImport,
    processCsvSubmission
  };
};

export default useObservationApi;
