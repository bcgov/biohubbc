import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IGetProjectAttachmentsResponse, IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyListResponse } from 'interfaces/useSurveyApi.interface';
import { createContext, PropsWithChildren, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { ApiPaginationRequestOptions } from 'types/misc';

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
   * @type {DataLoader<[pagination?: ApiPaginationRequestOptions], IGetSurveyListResponse, unknown>}
   * @memberof IProjectContext
   */
  surveysListDataLoader: DataLoader<[pagination?: ApiPaginationRequestOptions], IGetSurveyListResponse, unknown>;

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
  surveysListDataLoader: {} as DataLoader<[pagination?: ApiPaginationRequestOptions], IGetSurveyListResponse, unknown>,
  artifactDataLoader: {} as DataLoader<[project_id: number], IGetProjectAttachmentsResponse, unknown>,
  projectId: -1
});

export const ProjectContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const urlParams: Record<string, string | number | undefined> = useParams();
  const projectId = Number(urlParams['id']);

  const biohubApi = useBiohubApi();
  const projectDataLoader = useDataLoader(biohubApi.project.getProjectForView);
  const surveysListDataLoader = useDataLoader((pagination?: ApiPaginationRequestOptions) =>
    biohubApi.survey.getSurveysBasicFieldsByProjectId(projectId, pagination)
  );
  const artifactDataLoader = useDataLoader(biohubApi.project.getProjectAttachments);

  if (!urlParams['id']) {
    throw new Error(
      "The project ID found in ProjectContextProvider was invalid. Does your current React route provide an 'id' parameter?"
    );
  }

  /**
   * Refreshes the current project object whenever the current project ID changes
   */
  useEffect(() => {
    if (projectId) {
      projectDataLoader.refresh(projectId);
      // TODO remove this and write a comment explaining why? THe survey list component will already refresh this when it mounts...
      // surveysListDataLoader.refresh();
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
