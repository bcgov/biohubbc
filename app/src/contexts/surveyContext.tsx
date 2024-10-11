import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import { IGetSurveyAttachmentsResponse, IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import { IGetTechniquesResponse } from 'interfaces/useTechniqueApi.interface';
import { createContext, PropsWithChildren, useEffect, useMemo } from 'react';
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
   * The Data Loader used to load survey data
   *
   * @type {DataLoader<[project_id: number, survey_id: number], IGetSurveyAttachmentsResponse, unknown>}
   * @memberof ISurveyContext
   */
  artifactDataLoader: DataLoader<[project_id: number, survey_id: number], IGetSurveyAttachmentsResponse, unknown>;

  /**
   * The Data Loader used to load survey techniques
   *
   * @type {DataLoader<[project_id: number, survey_id: number], IGetSampleSiteResponse, unknown>}
   * @memberof ISurveyContext
   */
  techniqueDataLoader: DataLoader<[project_id: number, survey_id: number], IGetTechniquesResponse, unknown>;

  /**
   * The Data Loader used to load critters for a given survey
   *
   * @type {DataLoader<[project_id: number, survey_id: number], IDetailedCritterWithInternalId[], unknown>}
   * @memberof ISurveyContext
   */
  critterDataLoader: DataLoader<[project_id: number, survey_id: number], ICritterSimpleResponse[], unknown>;

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
  artifactDataLoader: {} as DataLoader<[project_id: number, survey_id: number], IGetSurveyAttachmentsResponse, unknown>,
  techniqueDataLoader: {} as DataLoader<[project_id: number, survey_id: number], IGetTechniquesResponse, unknown>,
  critterDataLoader: {} as DataLoader<[project_id: number, survey_id: number], ICritterSimpleResponse[], unknown>,
  projectId: -1,
  surveyId: -1
});

export const SurveyContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const biohubApi = useBiohubApi();
  const surveyDataLoader = useDataLoader(biohubApi.survey.getSurveyForView);
  const artifactDataLoader = useDataLoader(biohubApi.survey.getSurveyAttachments);
  const critterDataLoader = useDataLoader(biohubApi.survey.getSurveyCritters);
  const techniqueDataLoader = useDataLoader(biohubApi.technique.getTechniquesForSurvey);

  const urlParams: Record<string, string | number | undefined> = useParams();

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

  surveyDataLoader.load(projectId, surveyId);
  artifactDataLoader.load(projectId, surveyId);
  critterDataLoader.load(projectId, surveyId);

  /**
   * Refreshes the current survey object whenever the current survey ID changes from the currently loaded survey.
   */
  useEffect(() => {
    if (
      projectId &&
      surveyId &&
      (projectId !== surveyDataLoader.data?.surveyData.survey_details.project_id ||
        surveyId !== surveyDataLoader.data?.surveyData.survey_details.id)
    ) {
      surveyDataLoader.refresh(projectId, surveyId);
      artifactDataLoader.refresh(projectId, surveyId);
      critterDataLoader.refresh(projectId, surveyId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, surveyId]);

  const surveyContext: ISurveyContext = useMemo(() => {
    return {
      surveyDataLoader,
      artifactDataLoader,
      critterDataLoader,
      techniqueDataLoader,
      projectId,
      surveyId
    };
  }, [surveyDataLoader, artifactDataLoader, critterDataLoader, techniqueDataLoader, projectId, surveyId]);

  return <SurveyContext.Provider value={surveyContext}>{props.children}</SurveyContext.Provider>;
};
