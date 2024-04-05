import { AxiosInstance, AxiosProgressEvent, CancelTokenSource } from 'axios';
import {
  ObservationRecord,
  StandardObservationColumns,
  SupplementaryObservationCountData
} from 'contexts/observationsTableContext';
import {
  IGetSurveyObservationsGeometryResponse,
  IGetSurveyObservationsResponse
} from 'interfaces/useObservationApi.interface';
import { ApiPaginationRequestOptions } from 'types/misc';

export interface SubcountToSave {
  observation_subcount_id: number | null;
  subcount: number | null;
  qualitative: {
    measurement_id: string;
    measurement_option_id: string;
  }[];
  quantitative: {
    measurement_id: string;
    measurement_value: number;
  }[];
}

export interface IObservationTableRowToSave {
  standardColumns: StandardObservationColumns;
  subcounts: SubcountToSave[];
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
    await axios.put(`/api/project/${projectId}/survey/${surveyId}/observations`, {
      surveyObservations
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
   * @param {{
   *       samplingPeriodId: number;
   *     }} [options]
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
   * @param {{
   *       surveySamplePeriodId?: number;
   *     }} [options]
   * @return {*}
   */
  const processCsvSubmission = async (
    projectId: number,
    surveyId: number,
    submissionId: number,
    options?: {
      surveySamplePeriodId?: number;
    }
  ) => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/observations/process`, {
      observation_submission_id: submissionId,
      options
    });

    return data;
  };

  /**
   * Deletes all of the observation records having the given observation id.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {((string | number)[])} surveyObservationIds
   * @return {*}  {Promise<{ supplementaryObservationData: SupplementaryObservationCountData }>}
   */
  const deleteObservationRecords = async (
    projectId: number,
    surveyId: number,
    surveyObservationIds: (string | number)[]
  ): Promise<{ supplementaryObservationData: SupplementaryObservationCountData }> => {
    const { data } = await axios.post<{ supplementaryObservationData: SupplementaryObservationCountData }>(
      `/api/project/${projectId}/survey/${surveyId}/observations/delete`,
      { surveyObservationIds }
    );

    return data;
  };

  /**
   * Deletes all of the observation measurements, from all observation records, having the given taxon measurement id.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {string[]} measurementIds The critterbase taxon measurement ids to delete.
   * @return {*}  {Promise<void>}
   */
  const deleteObservationMeasurements = async (
    projectId: number,
    surveyId: number,
    measurementIds: string[]
  ): Promise<void> => {
    const { data } = await axios.post<void>(
      `/api/project/${projectId}/survey/${surveyId}/observations/measurements/delete`,
      {
        measurement_ids: measurementIds
      }
    );

    return data;
  };

  return {
    insertUpdateObservationRecords,
    getObservationRecords,
    getObservationRecord,
    getObservationsGeometry,
    deleteObservationRecords,
    deleteObservationMeasurements,
    uploadCsvForImport,
    processCsvSubmission
  };
};

export default useObservationApi;
