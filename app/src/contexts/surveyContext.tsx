import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { createContext, PropsWithChildren, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

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
   * The project ID belonging to the current project
   *
   * @type {number}
   * @memberof ISurveyContext
   */
  projectId: number;

  /**
   * The ID belonging to the current survey
   *
   * @type {number}
   * @memberof ISurveyContext
   */
  surveyId: number;
}

export const SurveyContext = createContext<ISurveyContext>({
  surveyDataLoader: {} as DataLoader<[project_id: number, survey_id: number], IGetSurveyForViewResponse, unknown>,
  projectId: -1,
  surveyId: -1
});

export const SurveyContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const biohubApi = useBiohubApi();
  const surveyDataLoader = useDataLoader(biohubApi.survey.getSurveyForView);
  const urlParams = useParams();

  if (!urlParams['id']) {
    throw new Error(
      "The project ID found in SurveyContextProvider was invalid. Does your current React route provide an 'id' parameter?"
    );
  }

  if (!urlParams['survey_id']) {
    throw new Error(
      "The survey ID found in SurveyContextProvider was invalid. Does your current React route provide a 'survey_id' parameter?"
    );
  }

  const projectId = Number(urlParams['id']);
  const surveyId = Number(urlParams['survey_id']);

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

  return <SurveyContext.Provider value={surveyContext}>{props.children}</SurveyContext.Provider>;
};
