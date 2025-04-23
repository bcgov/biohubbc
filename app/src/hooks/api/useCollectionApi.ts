import { AxiosInstance } from 'axios';
import { ICollectionAdvancedFilters } from 'features/summary/list-data/collection/CollectionListFilterForm';
import { ICreateCollectionRequest, IGetCollectionsResponse } from 'interfaces/useCollectionApi.interface';

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
    const { data } = await axios.post(`/api/collection/create`, collection);

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
    const { data } = await axios.post(`/api/collection/${collectionId}`, collection);

    return data;
  };

  /**
   * Get project collection details based on its ID for viewing purposes.
   *
   * @param {number} collectionId
   * @return {*} {Promise<IGetCollectionsResponse>}
   */
  const getCollectionForView = async (collectionId: number): Promise<IGetCollectionsResponse> => {
    const { data } = await axios.get(`/api/collection/${collectionId}/view`);

    return data;
  };

  /**
   * Get project collection details based on its ID for update purposes.
   *
   * @param {number} collectionId
   * @return {*} {Promise<IGetCollectionsResponse>}
   */
  const getCollectionForUpdate = async (collectionId: number): Promise<IGetCollectionsResponse> => {
    const { data } = await axios.get(`/api/collection/${collectionId}/update/get`);

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

  return { createCollection, updateCollection, findCollections, getCollectionForUpdate, getCollectionForView };
};
