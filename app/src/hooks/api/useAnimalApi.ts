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
   * Uploads attachments for a Critter Capture and deletes existing attachments if provided.
   *
   * @async
   * @param {*} params - Upload parameters.
   * @returns {*} Promise<void>
   */
  const uploadCritterCaptureAttachments = async (params: {
    projectId: number;
    surveyId: number;
    critterId: number;
    critterbaseCaptureId: string;
    files: File[];
    deleteIds?: number[];
    cancelTokenSource?: CancelTokenSource;
    onProgress?: (progressEvent: AxiosProgressEvent) => void;
  }) => {
    const fileData = new FormData();

    /**
     * Add all the files to the request FormData
     *
     * Note: Multer expecting a single key of 'media' for the array of files,
     * using `media[index]` will not work.
     */
    params.files.forEach((file) => {
      fileData.append(`media`, file);
    });

    // Add the existing attachment ids to delete
    if (params.deleteIds?.length) {
      params.deleteIds.forEach((id, idx) => {
        fileData.append(`delete_ids[${idx}]`, id.toString());
      });
    }

    await axios.post(
      `/api/project/${params.projectId}/survey/${params.surveyId}/critters/${params.critterId}/captures/${params.critterbaseCaptureId}/attachments/upload`,
      fileData,
      {
        cancelToken: params.cancelTokenSource?.token,
        onUploadProgress: params.onProgress
      }
    );
  };

  /**
   * Deletes all attachments for a Critter Capture.
   *
   * @async
   * @param {*} params - Delete parameters.
   * @returns {*} Promise<void>
   */
  const deleteCaptureAttachments = async (params: {
    projectId: number;
    surveyId: number;
    critterId: number;
    critterbaseCaptureId: string;
  }) => {
    await axios.delete(
      `/api/project/${params.projectId}/survey/${params.surveyId}/critters/${params.critterId}/captures/${params.critterbaseCaptureId}/attachments`
    );
  };

  return {
    getCaptureMortalityGeometry,
    findAnimals,
    uploadCritterCaptureAttachments,
    deleteCaptureAttachments
  };
};

export default useAnimalApi;
