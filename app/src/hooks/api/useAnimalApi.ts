import { AxiosInstance } from 'axios';
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

  return { getCaptureMortalityGeometry, findAnimals };
};

export default useAnimalApi;
