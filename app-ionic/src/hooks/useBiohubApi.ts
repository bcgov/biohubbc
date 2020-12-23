import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';
import { DatabaseContext } from 'contexts/DatabaseContext';
import {
  IPointOfInterestSearchCriteria,
  IActivitySearchCriteria,
  ICreateOrUpdateActivity
} from 'interfaces/useBiohubApi-interfaces';
import qs from 'qs';
import { useContext, useMemo } from 'react';

const API_HOST = process.env.REACT_APP_API_HOST;
const API_PORT = process.env.REACT_APP_API_PORT;

const API_URL = (API_PORT && `${API_HOST}:${API_PORT}`) || API_HOST || 'https://api-dev-biohubbc.pathfinder.gov.bc.ca';

/**
 * Returns an instance of axios with baseURL and authorization headers set.
 *
 * @return {*}
 */
const useApi = () => {
  const { keycloak } = useKeycloak();
  const instance = useMemo(() => {
    return axios.create({
      headers: {
        // 'Access-Control-Allow-Origin': '*',
        Authorization: `Bearer ${keycloak?.token}`
      },
      baseURL: API_URL
    });
  }, [keycloak]);

  return instance;
};

/**
 * Returns a set of supported api methods.
 *
 * @return {object} object whose properties are supported api methods.
 */
export const useBiohubApi = () => {
  const api = useApi();

  const databaseContext = useContext(DatabaseContext);

  /**
   * Fetch activities by search criteria.
   *
   * @param {activitiesSearchCriteria} activitiesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getActivities = async (activitiesSearchCriteria: IActivitySearchCriteria): Promise<any> => {
    const { data } = await api.post(`/api/activities/`, activitiesSearchCriteria);

    return data;
  };

  /**
   * Fetch points of interest by search criteria.
   *
   * @param {pointsOfInterestSearchCriteria} activitiesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getPointsOfInterest = async (pointsOfInterestSearchCriteria: IPointOfInterestSearchCriteria): Promise<any> => {
    const { data } = await api.post(`/api/points-of-interest/`, pointsOfInterestSearchCriteria);

    return data;
  };

  /**
   * Fetch a signle activity by its id.
   *
   * @param {string} activityId
   * @return {*}  {Promise<any>}
   */
  const getActivityById = async (activityId: string): Promise<any> => {
    const { data } = await api.get(`/api/activity/${activityId}`);

    return data;
  };

  /**
   * Fetch media items.
   *
   * @param {string[]} mediaKeys
   * @return {*}  {Promise<any>}
   */
  const getMedia = async (mediaKeys: string[]): Promise<any> => {
    const { data } = await api.get('/api/media/', {
      params: { key: mediaKeys },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  /**
   * Create a new activity record.
   *
   * @param {ICreateOrUpdateActivity} activity
   * @return {*}  {Promise<any>}
   */
  const createActivity = async (activity: ICreateOrUpdateActivity): Promise<any> => {
    const { data } = await api.post('/api/activity', activity);

    return data;
  };

  /**
   * Update an existing activity record.
   *
   * @param {ICreateOrUpdateActivity} activity
   * @return {*}  {Promise<any>}
   */
  const updateActivity = async (activity: ICreateOrUpdateActivity): Promise<any> => {
    const { data } = await api.put('/api/activity', activity);

    return data;
  };

  /**
   * Fetch the api json-schema spec.
   *
   * @return {*}  {Promise<any>}
   */
  const getApiSpec = async (): Promise<any> => {
    const { data } = await api.get('/api/api-docs/');

    return data;
  };

  /**
   * Fetch the api json-schema spec and save it in the local database.
   * If the request fails (due to lack of internet connection, etc), then return the cached copy of the api spec.
   *
   * @return {*}  {Promise<any>}
   */
  const getCachedApiSpec = async (): Promise<any> => {
    try {
      const data = await getApiSpec();

      await databaseContext.database.upsert('ApiSpec', () => {
        return data;
      });

      return data;
    } catch (error) {
      const data = await databaseContext.database.get('ApiSpec');

      return data;
    }
  };

  return {
    getMedia,
    getActivities,
    getActivityById,
    createActivity,
    updateActivity,
    getApiSpec,
    getCachedApiSpec,
    getPointsOfInterest
  };
};
