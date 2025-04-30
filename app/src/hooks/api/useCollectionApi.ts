import { AxiosInstance } from 'axios';
import { ICollectionAdvancedFilters } from 'features/summary/list-data/collection/CollectionListFilterForm';
import { ISurveyAdvancedFilters } from 'features/summary/list-data/survey/SurveysListFilterForm';
import { IObservationsAdvancedFilters } from 'features/summary/tabular-data/observation/ObservationsListFilterForm';
import {
  ICollection,
  ICollectionParticipantResponse,
  ICollectionParticipantsAdvancedFilters,
  ICreateCollectionRequest,
  ICreateCollectionSurveyRequest,
  ICreateSurveyCollectionRequest,
  IGetCollectionsResponse,
  IPostCollectionParticipant
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
   * Adds participants to the collection
   *
   * @param {number} collectionId
   * @param {IPostCollectionParticipant[]} participants
   * @return {*}  {Promise<void>}
   */
  const addParticipants = async (collectionId: number, participants: IPostCollectionParticipant[]): Promise<void> => {
    const { data } = await axios.post(`/api/collection/${collectionId}/participant`, {
      participants
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
   * Get collection participants
   * @param {number} collectionId
   */
  const getParticipants = async (
    collectionId: number,
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: ICollectionParticipantsAdvancedFilters
  ): Promise<ICollectionParticipantResponse> => {
    const params = {
      ...pagination,
      ...filterFieldData
    };
    const { data } = await axios.get(`/api/collection/${collectionId}/participant`, {
      params,
      paramsSerializer: (params) => qs.stringify(params)
    });

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

  return {
    createCollection,
    addToCollections,
    getParticipants,
    updateCollection,
    addSurveys,
    findCollections,
    getSurveysInCollection,
    getObservations,
    addParticipants,
    getCollection,
    deleteCollection
  };
};
