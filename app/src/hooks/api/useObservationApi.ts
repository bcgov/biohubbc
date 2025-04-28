import { AxiosInstance, AxiosProgressEvent, CancelTokenSource } from 'axios';
import { IObservationsAdvancedFilters } from 'features/summary/tabular-data/observation/ObservationsListFilterForm';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';
import {
  ICreateObservation,
  IEditObservation,
  IGetSurveyFlattenedObservationsResponse,
  IGetSurveyObservationsGeometryResponse,
  IGetSurveyObservationsResponse,
  SurveyObservationBasic,
  SurveyObservationWithSupplementaryData
} from 'interfaces/useObservationApi.interface';
import { EnvironmentTypeIds } from 'interfaces/useReferenceApi.interface';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with observations.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useObservationApi = (axios: AxiosInstance) => {
  /**
   * Creates a new observation for the survey
   * @param {number} surveyId
   * @param {ICreateObservation} surveyObservation
   * @return {*}  {Promise<void>}
   */
  const createObservation = async (surveyId: number, surveyObservation: ICreateObservation): Promise<void> => {
    await axios.post(`/api/survey/${surveyId}/observations`, {
      surveyObservations: [surveyObservation]
    });
  };

  /**
   * Updates an existing observation for the survey
   * @param {number} surveyId
   * @param {number} surveyObservationId
   * @param {IEditObservation} surveyObservation
   * @return {*}  {Promise<void>}
   */
  const updateObservation = async (
    surveyId: number,
    surveyObservationId: number,
    surveyObservation: IEditObservation
  ): Promise<void> => {
    await axios.put(`/api/survey/${surveyId}/observations/${surveyObservationId}`, {
      surveyObservation: surveyObservation
    });
  };

  /**
   * Find observations.
   *
   * @param {ApiPaginationRequestOptions} [pagination]
   * @param {IObservationsAdvancedFilters} filterFieldData
   * @return {*} {Promise<IGetSurveyObservationsResponse[]>}
   */
  const findObservations = async (
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: IObservationsAdvancedFilters
  ): Promise<IGetSurveyObservationsResponse> => {
    const params = {
      ...pagination,
      ...filterFieldData
    };

    const { data } = await axios.get('/api/observation', {
      params
    });

    return data;
  };

  /**
   * Find flattened observations.
   *
   * @param {ApiPaginationRequestOptions} [pagination]
   * @param {IObservationsAdvancedFilters} filterFieldData
   * @return {*} {Promise<IFindSurveyFlattenedObservationsResponse[]>}
   */
  const findFlattenedObservations = async (
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: IObservationsAdvancedFilters
  ): Promise<IGetSurveyFlattenedObservationsResponse> => {
    const params = {
      ...pagination,
      ...filterFieldData
    };

    const { data } = await axios.get('/api/observation/flattened', {
      params
    });

    return data;
  };

  /**
   * Retrieves all survey observation records for the given survey
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IGetSurveyObservationsResponse>}
   */
  const getObservationRecords = async (
    surveyId: number,
    pagination?: ApiPaginationRequestOptions
  ): Promise<IGetSurveyObservationsResponse> => {
    const params = {
      ...pagination
    };

    const { data } = await axios.get<IGetSurveyObservationsResponse>(`/api/survey/${surveyId}/observations`, {
      params
    });

    return data;
  };

  /**
   * Retrieves all survey flattened observation records for the given survey
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IGetSurveyFlattenedObservationsResponse>}
   */
  const getFlattenedObservationRecords = async (
    surveyId: number,
    pagination?: ApiPaginationRequestOptions
  ): Promise<IGetSurveyFlattenedObservationsResponse> => {
    const params = {
      ...pagination
    };

    const { data } = await axios.get<IGetSurveyFlattenedObservationsResponse>(
      `/api/survey/${surveyId}/observations/flattened`,
      {
        params
      }
    );

    return data;
  };

  /**
   * Retrieves species observed in a given survey
   * @param {number} surveyId
   * @return {*}  {Promise<IPartialTaxonomy>}
   */
  const getObservedSpecies = async (surveyId: number): Promise<IPartialTaxonomy[]> => {
    const { data } = await axios.get<IPartialTaxonomy[]>(`/api/survey/${surveyId}/observations/taxon`);

    return data;
  };

  /**
   * Retrieves all measurements associated with all observation records
   * @param {number} surveyId
   * @return {*}  {Promise<IObservationTableRow[]>}
   */
  const getObservationMeasurementDefinitions = async (
    projectId: number,
    surveyId: number
  ): Promise<{
    qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
    quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
  }> => {
    const { data } = await axios.get<{
      qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
      quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
    }>(`/api/survey/${surveyId}/observations/measurements`);

    return data;
  };

  /**
   * Get a survey observation record, with additional data.
   * @param {number} surveyId
   * @param {number} surveyObservationId
   * @return {*}  {Promise<SurveyObservationWithSupplementaryData>}
   */
  const getObservationRecord = async (
    surveyId: number,
    surveyObservationId: number
  ): Promise<SurveyObservationWithSupplementaryData> => {
    const { data } = await axios.get<SurveyObservationWithSupplementaryData>(
      `/api/survey/${surveyId}/observations/${surveyObservationId}`
    );

    return data;
  };

  /**
   * Get a survey observation record.
   * @param {number} surveyId
   * @param {number} surveyObservationId
   * @return {*}  {Promise<SurveyObservationBasic>}
   */
  const getBasicObservationRecord = async (
    surveyId: number,
    surveyObservationId: number
  ): Promise<SurveyObservationBasic> => {
    const { data } = await axios.get<SurveyObservationBasic>(
      `/api/survey/${surveyId}/observations/${surveyObservationId}/basic`
    );

    return data;
  };

  /**
   * Fetches all geojson geometry points for all observation records belonging to
   * the given survey.
   * @param {number} surveyId
   * @return {*}  {Promise<IGetSurveyObservationsGeometryResponse>}
   */
  const getObservationsGeometry = async (
    projectId: number,
    surveyId: number
  ): Promise<IGetSurveyObservationsGeometryResponse> => {
    const { data } = await axios.get<IGetSurveyObservationsGeometryResponse>(
      `/api/survey/${surveyId}/observations/spatial`
    );

    return data;
  };

  /**
   * Imports observation records from a CSV file.
   *
   * @param {{
   *    projectId: number;
   *    surveyId: number;
   *    file: File; // The CSV file to import.
   *    surveySamplePeriodId?: number; // Optional sample period id to associate all imported records with.
   *    cancelTokenSource?: CancelTokenSource;
   *    onProgress?: (progressEvent: AxiosProgressEvent) => void;
   * }} params
   * @return {*}  {Promise<{ submissionId: number }>}
   */
  const importObservationCSV = async (params: {
    surveyId: number;
    file: File;
    surveySamplePeriodId?: number;
    cancelTokenSource?: CancelTokenSource;
    onProgress?: (progressEvent: AxiosProgressEvent) => void;
  }): Promise<void> => {
    const formData = new FormData();

    formData.append('media', params.file);

    if (params.surveySamplePeriodId) {
      formData.append('surveySamplePeriodId', params.surveySamplePeriodId.toString());
    }

    await axios.post(`/api/survey/${params.surveyId}/observations/import`, formData, {
      cancelToken: params.cancelTokenSource?.token,
      onUploadProgress: params.onProgress
    });
  };

  /**
   * Deletes all of the observation records having the given observation id.
   * @param {number} surveyId
   * @param {((string | number)[])} surveyObservationIds
   * @return {*}  {Promise<void>}
   */
  const deleteObservationRecords = async (
    surveyId: number,
    surveyObservationIds: (string | number)[]
  ): Promise<void> => {
    await axios.post(`/api/survey/${surveyId}/observations/delete`, { surveyObservationIds });
  };

  /**
   * Delete observation subcount records having the given observation subcount id.
   *
   * Note: An observation must have at least one subcount. If all subcount records are deleted, the observation record
   * will also be deleted.
   * @param {number} surveyId
   * @param {((string | number)[])} observationSubcountIds
   * @return {*}  {Promise<void>}
   */
  const deleteObservationSubcounts = async (
    surveyId: number,
    observationSubcountIds: (string | number)[]
  ): Promise<void> => {
    await axios.post(`/api/survey/${surveyId}/observations/subcounts/delete`, {
      observationSubcountIds
    });
  };

  /**
   * Deletes all of the observation environments, from all observation records, having the given environment_id.
   * @param {number} surveyId
   * @param {string[]} environmentIds The environment ids to delete.
   * @return {*}  {Promise<void>}
   */
  const deleteObservationEnvironments = async (surveyId: number, environmentIds: EnvironmentTypeIds): Promise<void> => {
    const { data } = await axios.post<void>(`/api/survey/${surveyId}/observations/environments/delete`, {
      environment_qualitative_id: environmentIds.qualitative_environments,
      environment_quantitative_id: environmentIds.quantitative_environments
    });

    return data;
  };

  return {
    getObservationRecords,
    getFlattenedObservationRecords,
    getObservationRecord,
    getBasicObservationRecord,
    getObservedSpecies,
    findObservations,
    findFlattenedObservations,
    getObservationsGeometry,
    getObservationMeasurementDefinitions,
    deleteObservationRecords,
    deleteObservationSubcounts,
    deleteObservationEnvironments,
    importObservationCSV,
    createObservation,
    updateObservation
  };
};

export default useObservationApi;
