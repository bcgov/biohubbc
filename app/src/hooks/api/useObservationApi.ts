import { AxiosInstance, AxiosProgressEvent, CancelTokenSource } from 'axios';
import { IObservationsAdvancedFilters } from 'features/summary/tabular-data/observation/ObservationsListFilterForm';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';
import {
  ICreateEditObservation,
  ICreateObservation,
  IGetSurveyFlattenedObservationsResponse,
  IGetSurveyObservationsGeometryResponse,
  IGetSurveyObservationsResponse,
  ObservationRecord
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
   * Insert/updates all survey observation records for the given survey
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ICreateEditObservation[]} surveyObservations
   * @return {*}  {Promise<void>}
   */
  const insertUpdateObservationRecords = async (
    projectId: number,
    surveyId: number,
    surveyObservations: ICreateEditObservation[]
  ): Promise<void> => {
    await axios.put(`/api/project/${projectId}/survey/${surveyId}/observations`, {
      surveyObservations
    });
  };

  /**
   * Creates a new observation for the survey
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ICreateObservation} surveyObservation
   * @return {*}  {Promise<void>}
   */
  const createObservation = async (
    projectId: number,
    surveyId: number,
    surveyObservation: ICreateObservation
  ): Promise<void> => {
    await axios.post(`/api/project/${projectId}/survey/${surveyId}/observations`, surveyObservation);
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
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IGetSurveyObservationsResponse>}
   */
  const getObservationRecords = async (
    projectId: number,
    surveyId: number,
    pagination?: ApiPaginationRequestOptions
  ): Promise<IGetSurveyObservationsResponse> => {
    const params = {
      ...pagination
    };

    const { data } = await axios.get<IGetSurveyObservationsResponse>(
      `/api/project/${projectId}/survey/${surveyId}/observations`,
      {
        params
      }
    );

    return data;
  };

  /**
   * Retrieves all survey flattened observation records for the given survey
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IGetSurveyFlattenedObservationsResponse>}
   */
  const getFlattenedObservationRecords = async (
    projectId: number,
    surveyId: number,
    pagination?: ApiPaginationRequestOptions
  ): Promise<IGetSurveyFlattenedObservationsResponse> => {
    const params = {
      ...pagination
    };

    const { data } = await axios.get<IGetSurveyFlattenedObservationsResponse>(
      `/api/project/${projectId}/survey/${surveyId}/observations/flattened`,
      {
        params
      }
    );

    return data;
  };

  /**
   * Retrieves species observed in a given survey
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<IPartialTaxonomy>}
   */
  const getObservedSpecies = async (projectId: number, surveyId: number): Promise<IPartialTaxonomy[]> => {
    const { data } = await axios.get<IPartialTaxonomy[]>(
      `/api/project/${projectId}/survey/${surveyId}/observations/taxon`
    );

    return data;
  };

  /**
   * Retrieves all measurements associated with all observation records
   *
   * @param {number} projectId
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
    }>(`/api/project/${projectId}/survey/${surveyId}/observations/measurements`);

    return data;
  };

  /**
   * Retrieves all survey observation records for the given survey
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<ObservationRecord>}
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
    projectId: number;
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

    await axios.post(`/api/project/${params.projectId}/survey/${params.surveyId}/observations/import`, formData, {
      cancelToken: params.cancelTokenSource?.token,
      onUploadProgress: params.onProgress
    });
  };

  /**
   * Deletes all of the observation records having the given observation id.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {((string | number)[])} surveyObservationIds
   * @return {*}  {Promise<void>}
   */
  const deleteObservationRecords = async (
    projectId: number,
    surveyId: number,
    surveyObservationIds: (string | number)[]
  ): Promise<void> => {
    await axios.post(`/api/project/${projectId}/survey/${surveyId}/observations/delete`, { surveyObservationIds });
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

  /**
   * Deletes all of the observation environments, from all observation records, having the given environment_id.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {string[]} environmentIds The environment ids to delete.
   * @return {*}  {Promise<void>}
   */
  const deleteObservationEnvironments = async (
    projectId: number,
    surveyId: number,
    environmentIds: EnvironmentTypeIds
  ): Promise<void> => {
    const { data } = await axios.post<void>(
      `/api/project/${projectId}/survey/${surveyId}/observations/environments/delete`,
      {
        environment_qualitative_id: environmentIds.qualitative_environments,
        environment_quantitative_id: environmentIds.quantitative_environments
      }
    );

    return data;
  };

  return {
    insertUpdateObservationRecords,
    getObservationRecords,
    getFlattenedObservationRecords,
    getObservationRecord,
    getObservedSpecies,
    findObservations,
    findFlattenedObservations,
    getObservationsGeometry,
    getObservationMeasurementDefinitions,
    deleteObservationRecords,
    deleteObservationMeasurements,
    deleteObservationEnvironments,
    importObservationCSV,
    createObservation
  };
};

export default useObservationApi;
