import { AxiosInstance } from 'axios';
import { ICollectionAdvancedFilters } from 'features/summary/list-data/collection/CollectionListFilterForm';
import { IObservationsAdvancedFilters } from 'features/summary/tabular-data/observation/ObservationsListFilterForm';
import { ICollection, ICreateCollectionRequest, IGetCollectionsResponse } from 'interfaces/useCollectionApi.interface';
import { IGetSurveyObservationsResponse } from 'interfaces/useObservationApi.interface';

import qs from 'qs';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with collections.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const useCollectionApi = (axios: AxiosInstance) => {
  /**
   * Create a new collection
   *
   * @param {ICreateCollectionRequest} collection
   * @return {*}  {Promise<ICreateCollectionResponse>}
   */
  const createCollection = async (collection: ICreateCollectionRequest): Promise<IGetCollectionsResponse> => {
    const { data } = await axios.post(`/api/collection`, collection);

    return data;
  };

  /**
   * Update a collection
   *
   * @param {number} collectionId
   * @param {ICreateCollectionRequest} collection
   * @return {*}  {Promise<ICreateCollectionResponse>}
   */
  const updateCollection = async (
    collectionId: number,
    collection: ICreateCollectionRequest
  ): Promise<IGetCollectionsResponse> => {
    const { data } = await axios.put(`/api/collection/${collectionId}`, collection);

    return data;
  };

  /**
   * Get all observations from surveys in the collection
   * @param {number} collectionId
   */
  const getObservations = async (
    collectionId: number,
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: IObservationsAdvancedFilters
  ): Promise<IGetSurveyObservationsResponse> => {
    const params = {
      ...pagination,
      ...filterFieldData
    };
    const { data } = await axios.get(`/api/collection/${collectionId}/observation`, {
      params,
      paramsSerializer: (params) => qs.stringify(params)
    });

    return data;
  };

  /**
   * Delete a collection
   *
   * @param {number} collectionId
   * @return {*}  {Promise<ICreateCollectionResponse>}
   */
  const deleteCollection = async (collectionId: number): Promise<IGetCollectionsResponse> => {
    const { data } = await axios.delete(`/api/collection/${collectionId}`);

    return data;
  };

  /**
   * Get project collection details based on its ID
   *
   * @param {number} collectionId
   * @return {*} {Promise<ICollection>}
   */
  const getCollection = async (collectionId: number): Promise<ICollection> => {
    const { data } = await axios.get(`/api/collection/${collectionId}`);

    return data;
  };

  /**
   * Get collections for a system user id.
   *
   * @param {ApiPaginationRequestOptions} [pagination]
   * @param {ICollectionAdvancedFilters} filterFieldData
   * @return {*} {Promise<IFindProjectsResponse[]>}
   */
  const findCollections = async (
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: ICollectionAdvancedFilters
  ): Promise<IGetCollectionsResponse> => {
    const params = {
      ...pagination,
      ...filterFieldData
    };

    const { data } = await axios.get('/api/collection', { params, paramsSerializer: (params) => qs.stringify(params) });

    return data;
  };

  return { createCollection, updateCollection, findCollections, getObservations, getCollection, deleteCollection };
};
