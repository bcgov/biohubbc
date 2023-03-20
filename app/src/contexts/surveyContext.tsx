import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { createContext, PropsWithChildren, useEffect, useMemo } from 'react';
// import { matchPath, useLocation } from 'react-router';

/**
 * Context object that stores information about a survey
 *
 * @export
 * @interface ISurveyContext
 */
export interface ISurveyContext {
  /**
   * The Data Loader used to load survey data
   *
   * @type {DataLoader<[project_id: number, survey_id: number], IGetSurveyForViewResponse, unknown>}
   * @memberof ISurveyContext
   */
  surveyDataLoader: DataLoader<[project_id: number, survey_id: number], IGetSurveyForViewResponse, unknown>;

  /**
   * The project ID belonging to the current survey
   *
   * @type {}
   * @memberof ISurveyContext
   */
  projectId: number | null;

  /**
   * The ID belonging to the current survey
   *
   * @type {number | null}
   * @memberof ISurveyContext
   */
  surveyId: number | null;
}

interface ISurveyContextProps {
  surveyId: string | number | null;
  projectId: string | number | null;
}

export const SurveyContext = createContext<ISurveyContext>({
  surveyDataLoader: {} as DataLoader<[project_id: number, survey_id: number], IGetSurveyForViewResponse, unknown>,
  projectId: null,
  surveyId: null
});

export const SurveyContextProvider = (props: PropsWithChildren<ISurveyContextProps>) => {
  const biohubApi = useBiohubApi();
  const surveyDataLoader = useDataLoader(biohubApi.survey.getSurveyForView);

  if (!props.projectId) {
    throw new Error("The project ID found in SurveyContextProvider was invalid. Does your current React route provide an 'id' parameter?");
  } else if (!props.surveyId) {
    throw new Error("The survey ID found in SurveyContextProvider was invalid. Does your current React route provide a 'survey_id' parameter?");
  }

  const projectId = Number(props.projectId);
  const surveyId = Number(props.surveyId);

  /**
   * Refreshes the current survey object whenever the current survey ID changes
   */
  useEffect(() => {
    if (projectId && surveyId) {
      surveyDataLoader.refresh(projectId, surveyId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, surveyId]);

  const surveyContext: ISurveyContext = useMemo(
    () => ({
      surveyDataLoader,
      projectId,
      surveyId
    }),
    [surveyDataLoader, projectId, surveyId]
  );

  return <SurveyContext.Provider value={surveyContext} {...props} />;
};
