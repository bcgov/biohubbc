import { AxiosInstance } from 'axios';
import { ICollectionAdvancedFilters } from 'features/summary/list-data/collection/CollectionListFilterForm';
import { ISurveyAdvancedFilters } from 'features/summary/list-data/survey/SurveysListFilterForm';
import { IObservationsAdvancedFilters } from 'features/summary/tabular-data/observation/ObservationsListFilterForm';
import {
  ICollection,
  ICollectionMemberResponse,
  ICollectionMembersAdvancedFilters,
  ICreateCollectionRequest,
  ICreateCollectionSurveyRequest,
  ICreateSurveyCollectionRequest,
  IGetCollectionHierarchyResponse,
  IGetCollectionsResponse,
  IPostCollectionMember
} from 'interfaces/useCollectionApi.interface';
import { IGetSurveyObservationsResponse } from 'interfaces/useObservationApi.interface';
import { IFindSurveysResponse } from 'interfaces/useSurveyApi.interface';

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
   * @return {*}  {Promise<IGetCollectionResponse>}
   */
  const createCollection = async (collection: ICreateCollectionRequest): Promise<IGetCollectionsResponse> => {
    const { data } = await axios.post(`/api/collection`, collection);

    return data;
  };

  /**
   * Create a new subcollection that is a child of an existing collection
   *
   * @param {number} collectionId
   * @param {ICreateCollectionRequest} collection
   * @return {*}  {Promise<IGetCollectionResponse>}
   */
  const createSubcollection = async (
    collectionId: number,
    collection: ICreateCollectionRequest
  ): Promise<IGetCollectionsResponse> => {
    const { data } = await axios.post(`/api/collection/${collectionId}`, collection);

    return data;
  };

  /**
   * Get the parents of the given collection
   *
   * @param {number} collectionId
   * @return {*}  {Promise<IGetCollectionResponse>}
   */
  const getCollectionParents = async (collectionId: number): Promise<IGetCollectionHierarchyResponse> => {
    const { data } = await axios.get(`/api/collection/${collectionId}/hierarchy`);

    return data;
  };

  /**
   * Adds a survey to existing collections
   * @param {number} surveyId
   * @param {ICreateCollectionSurveyRequest} values
   * @return {*}  {Promise<void>}
   */
  const addToCollections = async (
    surveyId: number,
    values: ICreateCollectionSurveyRequest
  ): Promise<IGetCollectionsResponse> => {
    const { data } = await axios.post(`/api/survey/${surveyId}/collection`, values);

    return data;
  };

  /**
   * Adds members to the collection
   *
   * @param {number} collectionId
   * @param {IPostCollectionMember[]} members
   * @return {*}  {Promise<void>}
   */
  const addMembers = async (collectionId: number, members: IPostCollectionMember[]): Promise<void> => {
    const { data } = await axios.post(`/api/collection/${collectionId}/member`, {
      members
    });

    return data;
  };

  /**
   * Adds multiple surveys to a collection
   *
   * @param {ICreateSurveyCollectionRequest} values
   * @return {*}  {Promise<void>}
   */
  const addSurveys = async (values: ICreateSurveyCollectionRequest): Promise<IGetCollectionsResponse> => {
    const { data } = await axios.post(`/api/collection/${values.collection_id}/survey`, values);

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
   * Get list of surveys in the collection
   * @param {number} collectionId
   */
  const getSurveysInCollection = async (
    collectionId: number,
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: ISurveyAdvancedFilters
  ): Promise<IFindSurveysResponse> => {
    const params = {
      ...pagination,
      ...filterFieldData
    };
    const { data } = await axios.get(`/api/collection/${collectionId}/survey`, {
      params,
      paramsSerializer: (params) => qs.stringify(params)
    });

    return data;
  };

  /**
   * Get collection members
   * @param {number} collectionId
   */
  const getMembers = async (
    collectionId: number,
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: ICollectionMembersAdvancedFilters
  ): Promise<ICollectionMemberResponse> => {
    const params = {
      ...pagination,
      ...filterFieldData
    };
    const { data } = await axios.get(`/api/collection/${collectionId}/member`, {
      params,
      paramsSerializer: (params) => qs.stringify(params)
    });

    return data;
  };

  /**
   * Get all observations from surveys in the collection
   *
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
   * Get a specific collection by its id
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

  /**
   * Get subcollections for the given collection id
   *
   * @param {number} collectionId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @param {ICollectionAdvancedFilters} filterFieldData
   * @return {*} {Promise<IFindProjectsResponse[]>}
   */
  const findSubcollections = async (
    collectionId: number,
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: ICollectionAdvancedFilters
  ): Promise<IGetCollectionsResponse> => {
    const params = {
      ...pagination,
      ...filterFieldData
    };

    const { data } = await axios.get(`/api/collection/${collectionId}/subcollection`, {
      params,
      paramsSerializer: (params) => qs.stringify(params)
    });

    return data;
  };

  /**
   * Delete a member from a collection
   */
  const deleteMember = async (collectionId: number, collectionMemberId: number): Promise<void> => {
    await axios.delete(`/api/collection/${collectionId}/member`, {
      params: { collectionMemberId }
    });
  };

  return {
    createCollection,
    createSubcollection,
    getCollectionParents,
    addToCollections,
    getMembers,
    updateCollection,
    addSurveys,
    findCollections,
    findSubcollections,
    getSurveysInCollection,
    getObservations,
    addMembers,
    getCollection,
    deleteCollection,
    deleteMember
  };
};
