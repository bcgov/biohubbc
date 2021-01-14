import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';
import { IProject, IProjectPostObject } from 'interfaces/project-interfaces';
import { IActivity, ICreateActivity, ICreateProjectResponse, ITemplate } from 'interfaces/useBioHubApi-interfaces';
import moment from 'moment';
import { useMemo } from 'react';

const API_HOST = process.env.REACT_APP_API_HOST;
const API_PORT = process.env.REACT_APP_API_PORT;

const API_URL = (API_PORT && `${API_HOST}:${API_PORT}`) || API_HOST || 'api-dev-biohubbc.apps.silver.devops.gov.bc.ca';

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
    // const { data } = await api.get(`/api/projects`);

    // return data;

    // TODO: stub for development
    return [
      {
        id: 1,
        name: 'Project Name 1',
        objectives: 'Project Objectives 1',
        scientific_collection_permit_number: '123456',
        management_recovery_action: 'A',
        location_description: 'Location Description 1',
        start_date: moment().toISOString(),
        end_date: moment().toISOString(),
        results: 'Results 1',
        caveats: 'Caveats 1',
        comments: 'Comments 1'
      },
      {
        id: 2,
        name: 'Project Name 2',
        objectives: 'Project Objectives 2',
        scientific_collection_permit_number: '123456',
        management_recovery_action: 'A',
        location_description: 'Location Description 2',
        start_date: moment().toISOString(),
        end_date: moment().toISOString(),
        results: 'Results 2',
        caveats: 'Caveats 2',
        comments: 'Comments 2'
      },
      {
        id: 3,
        name: 'Project Name 3',
        objectives: 'Project Objectives 3',
        scientific_collection_permit_number: '123456',
        management_recovery_action: 'A',
        location_description: 'Location Description 3',
        start_date: moment().toISOString(),
        end_date: moment().toISOString(),
        results: 'Results 3',
        caveats: 'Caveats 3',
        comments: 'Comments 3'
      },
      {
        id: 4,
        name: 'Project Name 4',
        objectives: 'Project Objectives 4',
        scientific_collection_permit_number: '123456',
        management_recovery_action: 'A',
        location_description: 'Location Description 4',
        start_date: moment().toISOString(),
        end_date: moment().toISOString(),
        results: 'Results 4',
        caveats: 'Caveats 4',
        comments: 'Comments 4'
      }
    ];
  };

  /**
   * Get a project based on its ID.
   *
   * @param {projectId} projectId
   * @return {*}  {Promise<IProject>}
   */
  const getProject = async (projectId: number): Promise<IProject> => {
    const { data } = await api.get(`/api/project/${projectId}`);

    return data;
  };

  /**
   * Create a new project.
   *
   * @param {IProjectPostObject} project
   * @return {*}  {Promise<ICreateProjectResponse>}
   */
  const createProject = async (project: IProjectPostObject): Promise<ICreateProjectResponse> => {
    const { data } = await api.post('/api/project', project);

    return data;
  };

  /**
   * Get a template based on its ID.
   *
   * @param {templateId} templateId
   * @return {*}  {Promise<ITemplate>}
   */
  const getTemplate = async (templateId: number): Promise<ITemplate> => {
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
   * Fetch all code sets.
   *
   * @return {*}  {Promise<any>}
   */
  const getAllCodes = async (): Promise<any> => {
    const { data } = await api.get('/api/codes/');

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
    createProject,
    createActivity,
    getAllCodes,
    getApiSpec
  };
};
