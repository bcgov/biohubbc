import { AxiosInstance, AxiosProgressEvent, CancelTokenSource } from 'axios';
import { IAnimalsAdvancedFilters } from 'features/summary/tabular-data/animal/AnimalsListFilterForm';
import { IFindAnimalsResponse, IGetCaptureMortalityGeometryResponse } from 'interfaces/useAnimalApi.interface';
import qs from 'qs';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with SIMS animal (critter) records.
 *
 * Note: Not to be confused with the useCritterApi hook, which is for working with Critterbase animal (critter) records.
 * Note: SIMS animal records are linked to Critterbase animal records.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useAnimalApi = (axios: AxiosInstance) => {
  /**
   * Fetches all geojson capture and mortalities points for all animals in survey
   * the given survey.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<IGetSurveyObservationsGeometryResponse>}
   */
  const getCaptureMortalityGeometry = async (
    projectId: number,
    surveyId: number
  ): Promise<IGetCaptureMortalityGeometryResponse> => {
    const { data } = await axios.get<IGetCaptureMortalityGeometryResponse>(
      `/api/project/${projectId}/survey/${surveyId}/critters/spatial`
    );

    return data;
  };

  /**
   * Get animals for a system user id.
   *
   * @param {ApiPaginationRequestOptions} [pagination]
   * @param {IAnimalsAdvancedFilters} filterFieldData
   * @return {*}  {Promise<IFindAnimalsResponse>}
   */
  const findAnimals = async (
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: IAnimalsAdvancedFilters
  ): Promise<IFindAnimalsResponse> => {
    const params = {
      ...pagination,
      ...filterFieldData
    };

    const { data } = await axios.get('/api/animal', { params, paramsSerializer: (params) => qs.stringify(params) });

    return data;
  };

  /**
   * Uploads attachments for a Critter Capture.
   *
   * @async
   * @param {*} params - Upload parameters.
   * @returns {Promise<void>}
   */
  const uploadCritterCaptureAttachments = async (params: {
    projectId: number;
    surveyId: number;
    critterId: number;
    critterbaseCaptureId: string;
    files: File[];
    cancelTokenSource?: CancelTokenSource;
    onProgress?: (progressEvent: AxiosProgressEvent) => void;
  }) => {
    const fileData = new FormData();

    params.files.forEach((file) => {
      fileData.append('media', file);
    });

    await axios.post(
      `/api/project/${params.projectId}/survey/${params.surveyId}/critters/${params.critterId}/captures/${params.critterbaseCaptureId}/attachments/upload`,
      fileData,
      {
        cancelToken: params.cancelTokenSource?.token,
        onUploadProgress: params.onProgress
      }
    );
  };

  return { getCaptureMortalityGeometry, findAnimals, uploadCritterCaptureAttachments };
};

export default useAnimalApi;
