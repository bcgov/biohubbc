import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';
import { IProject } from 'interfaces/project-interfaces';
import { IActivity, ICreateActivity, ITemplate } from 'interfaces/useBioHubApi-interfaces';
import { useMemo } from 'react';

const API_HOST = process.env.REACT_APP_API_HOST;
const API_PORT = process.env.REACT_APP_API_PORT;

const API_URL = (API_PORT && `${API_HOST}:${API_PORT}`) || API_HOST || 'https://api-dev-biohubbc.apps.silver.devops.gov.bc.ca';

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

  /**
   * Get all projects.
   *
   * @return {*}  {Promise<IProject[]>}
   */
  const getProjects = async (): Promise<IProject[]> => {
    const { data } = await api.get(`/api/projects`);

    return data;
  };

  /**
   * Get a project based on its ID.
   *
   * @param {projectId} projectId
   * @return {*}  {Promise<IProject>}
   */
  const getProject = async (projectId: string): Promise<IProject> => {
    const { data } = await api.get(`/api/project/${projectId}`);

    return data;
  };

  /**
   * Get a template based on its ID.
   *
   * @param {templateId} templateId
   * @return {*}  {Promise<ITemplate>}
   */
  const getTemplate = async (templateId: string): Promise<ITemplate> => {
    const { data } = await api.get(`/api/template/${templateId}`);

    return data;
  };

  /**
   * Create a new activity record.
   *
   * @param {ICreateActivity} activity
   * @return {*}  {Promise<IActivity>}
   */
  const createActivity = async (activity: ICreateActivity): Promise<IActivity> => {
    const { data } = await api.post('/api/activity', activity);

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

  return {
    getProjects,
    getProject,
    getTemplate,
    createActivity,
    getApiSpec
  };
};
