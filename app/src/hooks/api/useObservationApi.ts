import { AxiosInstance, AxiosProgressEvent, CancelTokenSource } from 'axios';
import {
  ISupplementaryObservationData,
  ObservationRecord,
  StandardObservationColumns
} from 'contexts/observationsTableContext';
import {
  IGetSurveyObservationsGeometryResponse,
  IGetSurveyObservationsResponse
} from 'interfaces/useObservationApi.interface';
import { ApiPaginationRequestOptions } from 'types/misc';

export interface MeasurementColumnToSave {
  id: string;
  field: string;
  value: string | number | null;
}

export interface IObservationTableRowToSave {
  standardColumns: StandardObservationColumns;
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
   * @return {*}  {Promise<void>}
   */
  const insertUpdateObservationRecords = async (
    projectId: number,
    surveyId: number,
    surveyObservations: IObservationTableRowToSave[]
  ): Promise<void> => {
    // TODO: There is currently no way in the UI to add a sub count value
    // TODO: Business requirement to use sub counts as the primary count value
    const dataToSave = surveyObservations.map((item: IObservationTableRowToSave) => {
      item.standardColumns.subcount = item.standardColumns.count;
      return item;
    });

    // TODO `ObservationRecord[]` might not be the actual return value once measurements are being returned
    await axios.put<IGetSurveyObservationsResponse>(`/api/project/${projectId}/survey/${surveyId}/observations`, {
      surveyObservations: dataToSave
    });
  };

  /**
   * Retrieves all survey observation records for the given survey
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IObservationTableRow[]>}
   */
  const getObservationRecords = async (
    projectId: number,
    surveyId: number,
    pagination?: ApiPaginationRequestOptions
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

    // TODO: Using sub count value here as observation count may be depreciated
    // TODO: Business requirement to use sub counts as the primary count value
    data.surveyObservations = data.surveyObservations.map((item: any) => {
      item.count = item.subcount;
      return item;
    });
    return data;
  };

  /**
   * Retrieves all survey observation records for the given survey
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IObservationTableRow[]>}
   */
  const getObservationRecord = async (
    projectId: number,
    surveyId: number,
    surveyObservationId: number
  ): Promise<ObservationRecord> => {
    const { data } = await axios.get<ObservationRecord>(
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
   * @param {(progressEvent: AxiosProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<{ submissionId: number }>}
   */
  const uploadCsvForImport = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
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
