import { AxiosInstance } from 'axios';
import { IAnimalsAdvancedFilters } from 'features/summary/tabular-data/animal/AnimalsListContainer';
import { ICritterDetailedResponse } from 'interfaces/useCritterApi.interface';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with SIMS animal (critter) records.
 *
 * Note: Not to be confused with the useCritterApi hook, which is for working with CritterBase animal (critter) records.
 * Note: SIMS animal records are linked to CritterBase animal records.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useAnimalApi = (axios: AxiosInstance) => {
  /**
   * Get animals for a system user id.
   *
   * @param {ApiPaginationRequestOptions} [pagination]
   * @param {IAnimalsAdvancedFilters} filterFieldData
   * @return {*} {Promise<IgetProjectsForUserIdResponse[]>}
   */
  const getAnimalsList = async (
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: IAnimalsAdvancedFilters
  ): Promise<ICritterDetailedResponse[]> => {
    const params = new URLSearchParams();

    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (pagination.sort) {
        params.append('sort', pagination.sort);
      }
      if (pagination.order) {
        params.append('order', pagination.order);
      }
    }

    if (filterFieldData) {
      Object.entries(filterFieldData).forEach(([key, value]) => {
        params.append(key, value);
      });
    }

    const urlParamsString = `?${params.toString()}`;

    const { data } = await axios.get(`/api/animal${urlParamsString}`);

    return data;
  };

  return { getAnimalsList };
};

export { useAnimalApi };
