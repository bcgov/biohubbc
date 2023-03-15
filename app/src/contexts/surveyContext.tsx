import React, { createContext, PropsWithChildren, useContext, useEffect } from 'react';
import { useParams } from "react-router";

import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';



export interface ISurveyContext {
  surveyWithDetails: IGetSurveyForViewResponse | null;
  refresh(): void;
  _setSurveyId(surveyId: number): void;
  _setProjectId(projectId: number): void;
}

const SurveyContext = createContext<ISurveyContext>({
  surveyWithDetails: null,
  refresh: () => null,
  _setSurveyId: () => null,
  _setProjectId: () => null,
});

export const SurveyContextProvider = (props: PropsWithChildren<void>) => {
  const [surveyId, setSurveyId] = React.useState<number | null>(null);
  const [projectId, setProjectId] = React.useState<number | null>(null);

  const biohubApi = useBiohubApi();

  const surveyDataLoader = useDataLoader((project_id: number, survey_id: number) => {
    return biohubApi.survey.getSurveyForView(project_id, survey_id);
  });

  const refresh = () => {
    if (projectId && surveyId) {
      surveyDataLoader.refresh(projectId, surveyId)
    }
  }

  useEffect(() => {
    refresh()
  }, [projectId, surveyId])

  const surveyContext: ISurveyContext = {
    surveyWithDetails: surveyDataLoader.data || null,
    refresh,
    _setSurveyId: setSurveyId,
    _setProjectId: setProjectId
  }

  return (
    <SurveyContext.Provider value={surveyContext}>{props.children}</SurveyContext.Provider>
  );
}

export const useSurveyContext = () => {
  const urlParams = useParams();
  const surveyContext = useContext(SurveyContext);

  // Update survey each time the survey ID or project ID changes
  useEffect(() => {
    surveyContext._setSurveyId(urlParams['survey_id']);
    surveyContext._setProjectId(urlParams['id']);
  }, [urlParams]);

  return surveyContext;
}
