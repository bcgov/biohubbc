import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IGetProjectAttachmentsResponse, IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyListResponse } from 'interfaces/useSurveyApi.interface';
import { createContext, PropsWithChildren, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

/**
 * Context object that stores information about a project
 *
 * @export
 * @interface IProjectContext
 */
export interface IProjectContext {
  /**
   * The Data Loader used to load project data
   *
   * @type {DataLoader<[project_id: number], IGetProjectForViewResponse, unknown>}
   * @memberof IProjectContext
   */
  projectDataLoader: DataLoader<[project_id: number], IGetProjectForViewResponse, unknown>;

  /**
   * The Data Loader used to load project data
   *
   * @type {DataLoader<[project_id: number], IGetSurveyListResponse, unknown>}
   * @memberof IProjectContext
   */
  surveysListDataLoader: DataLoader<[project_id: number], IGetSurveyListResponse, unknown>;

  /**
   * The Data Loader used to load project data
   *
   * @type {DataLoader<[project_id: number], IGetProjectAttachmentsResponse, unknown>}
   * @memberof IProjectContext
   */
  artifactDataLoader: DataLoader<[project_id: number], IGetProjectAttachmentsResponse, unknown>;

  /**
   * The ID belonging to the current project
   *
   * @type {number}
   * @memberof IProjectContext
   */
  projectId: number;
}

export const ProjectContext = createContext<IProjectContext>({
  projectDataLoader: {} as DataLoader<[project_id: number], IGetProjectForViewResponse, unknown>,
  surveysListDataLoader: {} as DataLoader<[project_id: number], IGetSurveyListResponse, unknown>,
  artifactDataLoader: {} as DataLoader<[project_id: number], IGetProjectAttachmentsResponse, unknown>,
  projectId: -1
});

export const ProjectContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const biohubApi = useBiohubApi();
  const projectDataLoader = useDataLoader(biohubApi.project.getProjectForView);
  const surveysListDataLoader = useDataLoader(biohubApi.survey.getSurveysBasicFieldsByProjectId);
  const artifactDataLoader = useDataLoader(biohubApi.project.getProjectAttachments);
  const urlParams: Record<string, string | number | undefined> = useParams();

  if (!urlParams['id']) {
    throw new Error(
      "The project ID found in ProjectContextProvider was invalid. Does your current React route provide an 'id' parameter?"
    );
  }

  const projectId = Number(urlParams['id']);

  /**
   * Refreshes the current project object whenever the current project ID changes
   */
  useEffect(() => {
    if (projectId) {
      projectDataLoader.refresh(projectId);
      surveysListDataLoader.refresh(projectId);
      artifactDataLoader.refresh(projectId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const projectContext: IProjectContext = useMemo(() => {
    return {
      projectDataLoader,
      surveysListDataLoader,
      artifactDataLoader,
      projectId
    };
  }, [projectDataLoader, surveysListDataLoader, artifactDataLoader, projectId]);

  return <ProjectContext.Provider value={projectContext}>{props.children}</ProjectContext.Provider>;
};
