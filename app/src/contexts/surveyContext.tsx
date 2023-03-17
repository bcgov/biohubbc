import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { createContext, PropsWithChildren, useContext, useEffect } from 'react';
import { useParams } from 'react-router';

export interface ISurveyContext {
  surveyDataLoader: DataLoader<[project_id: number, survey_id: number], IGetSurveyForViewResponse, unknown>;
  projectId: number | null;
  surveyId: number | null;
  _setSurveyId(surveyId: number): void;
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

  useEffect(() => {
    if (projectId && surveyId) {
      surveyDataLoader.refresh(projectId, surveyId);
    }
  }, [projectId, surveyDataLoader, surveyId]);

  const surveyContext: ISurveyContext = {
    surveyDataLoader,
    projectId,
    surveyId,
    _setSurveyId: setSurveyId,
    _setProjectId: setProjectId
  };

  return <SurveyContext.Provider value={surveyContext} {...props} />;
};

/**
 *
 * @returns
 */
export const useSurveyContext = (): ISurveyContext => {
  const urlParams = useParams();
  const surveyContext = useContext(SurveyContext);

  // Update survey each time the survey ID or project ID changes
  useEffect(() => {
    surveyContext._setSurveyId(urlParams['survey_id']);
    surveyContext._setProjectId(urlParams['id']);
  }, [surveyContext, urlParams]);

  return surveyContext;
};
