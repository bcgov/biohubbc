import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo } from 'react';
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

  /**
   * Callback that updates the current survey loaded by the survey context Data Loader
   * 
   * @type {}
   * @memberof ISurveyContext
   */
  _setSurveyId(surveyId: number): void;

  /**
   * Callback that updates the current project ID for the survey context
   * 
   * @type {}
   * @memberof ISurveyContext
   */
  _setProjectId(projectId: number): void;
}

const SurveyContext = createContext<ISurveyContext>({
  surveyDataLoader: {} as DataLoader<[project_id: number, survey_id: number], IGetSurveyForViewResponse, unknown>,
  projectId: null,
  surveyId: null,
  _setSurveyId: () => null,
  _setProjectId: () => null
});

export const SurveyContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const [surveyId, setSurveyId] = React.useState<number | null>(null);
  const [projectId, setProjectId] = React.useState<number | null>(null);

  const biohubApi = useBiohubApi();
  const surveyDataLoader = useDataLoader(biohubApi.survey.getSurveyForView);

  /**
   * Refreshes the current survey object whenever the current survey ID changes
   */
  useEffect(() => {
    if (projectId && surveyId) {
      surveyDataLoader.refresh(projectId, surveyId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, surveyId]);

  const surveyContext: ISurveyContext = useMemo(() => ({
    surveyDataLoader,
    projectId,
    surveyId,
    _setSurveyId: setSurveyId,
    _setProjectId: setProjectId
  }), [surveyDataLoader, projectId, surveyId, setSurveyId, setProjectId]);

  return <SurveyContext.Provider value={surveyContext} {...props} />;
};

/**
 * Creates a hook that provides Survey Context.
 * 
 * @returns {ISurveyContext} The Survey Context object
 */
export const useSurveyContext = (): ISurveyContext => {
  const urlParams = useParams();
  const surveyContext = useContext(SurveyContext);

  /**
   * Maintains the current survey loaded by the Data Loader updating the current survey ID
   * based on the current survey ID and project ID route parameter
   */
  useEffect(() => {
    surveyContext._setSurveyId(urlParams['survey_id']);
    surveyContext._setProjectId(urlParams['id']);
  }, [surveyContext, urlParams]);

  return surveyContext;
};
