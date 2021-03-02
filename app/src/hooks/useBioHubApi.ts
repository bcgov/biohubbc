import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';
import { ConfigContext } from 'contexts/configContext';
import { IProject } from 'interfaces/project-interfaces';
import {
  IActivity,
  ICreateActivity,
  ICreateProjectResponse,
  IMedia,
  IProjectPostObject,
  ITemplate
} from 'interfaces/useBioHubApi-interfaces';
import { useContext, useMemo } from 'react';
import { ensureProtocol } from 'utils/Utils';

/**
 * Returns an instance of axios with baseURL and authorization headers set.
 *
 * @return {*}
 */
const useApi = () => {
  const { keycloak } = useKeycloak();

  const config = useContext(ConfigContext);

  const instance = useMemo(() => {
    return axios.create({
      headers: {
        Authorization: `Bearer ${keycloak?.token}`
      },
      baseURL: config?.API_HOST && ensureProtocol(config.API_HOST)
    });
  }, [config, keycloak]);

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
   * Upload project artifacts.
   *
   * @param projectId
   * @param files
   * @return {*} {Promise<IUploadProjectArtifactsResponse>}
   */
  const uploadProjectArtifacts = async (projectId: number, files: File[]): Promise<string[]> => {
    const req_message = new FormData();

    files.forEach((file) => req_message.append('media', file));

    const { data } = await api.post(`/api/projects/${projectId}/artifacts/upload`, req_message);

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

  /**
   * Fetch the media list.
   *
   * @return {*} {Promise<IMedia[]>}
   */

  const getMediaList = async (projectId: string): Promise<IMedia[]> => {
    //const api = await apiPromise;

    const { data } = await api.get(`/api/projects/${projectId}/artifacts/list`);

    const mediaKeyList: IMedia[] = [];

    if (!data || !data.length) {
      return mediaKeyList;
    }

    data.forEach((file: any) => {
      const mediaKey: IMedia = {
        file_name: file.key,
        encoded_file: ''
      };
      mediaKeyList.push(mediaKey);
    });

    return mediaKeyList;
  };
  return {
    getProjects,
    getProject,
    getTemplate,
    createProject,
    createActivity,
    getAllCodes,
    getApiSpec,
    getMediaList,
    uploadProjectArtifacts
  };
};
