import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import { IGetSurveyAttachmentsResponse, IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
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
   * @type {DataLoader<[survey_id: number], IGetSurveyForViewResponse, unknown>}
   * @memberof ISurveyContext
   */
  surveyDataLoader: DataLoader<[survey_id: number], IGetSurveyForViewResponse, unknown>;

  /**
   * The Data Loader used to load survey data
   *
   * @type {DataLoader<[survey_id: number], IGetSurveyAttachmentsResponse, unknown>}
   * @memberof ISurveyContext
   */
  artifactDataLoader: DataLoader<[survey_id: number], IGetSurveyAttachmentsResponse, unknown>;

  /**
   * The Data Loader used to load critters for a given survey
   *
   * @type {DataLoader<[survey_id: number], IDetailedCritterWithInternalId[], unknown>}
   * @memberof ISurveyContext
   */
  critterDataLoader: DataLoader<[survey_id: number], ICritterSimpleResponse[], unknown>;

  /**
   * The ID belonging to the current survey
   *
   * @type {number}
   * @memberof ISurveyContext
   */
  surveyId: number;
}

export const SurveyContext = createContext<ISurveyContext>({
  surveyDataLoader: {} as DataLoader<[survey_id: number], IGetSurveyForViewResponse, unknown>,
  artifactDataLoader: {} as DataLoader<[survey_id: number], IGetSurveyAttachmentsResponse, unknown>,
  critterDataLoader: {} as DataLoader<[survey_id: number], ICritterSimpleResponse[], unknown>,
  surveyId: -1
});

export const SurveyContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const biohubApi = useBiohubApi();
  const surveyDataLoader = useDataLoader(biohubApi.survey.getSurveyForView);
  const artifactDataLoader = useDataLoader(biohubApi.survey.getSurveyAttachments);
  const critterDataLoader = useDataLoader(biohubApi.survey.getSurveyCritters);

  const urlParams: Record<string, string | number | undefined> = useParams<{ survey_id: string }>();

  if (!urlParams['survey_id']) {
    throw new Error(
      "The survey ID found in SurveyContextProvider was invalid. Does your current React route provide a 'survey_id' parameter?"
    );
  }

  const surveyId = Number(urlParams['survey_id']);

  useEffect(() => {
    surveyDataLoader.load(surveyId);
    artifactDataLoader.load(surveyId);
    critterDataLoader.load(surveyId);
  }, [surveyId, critterDataLoader, artifactDataLoader, surveyDataLoader]);

  /**
   * Refreshes the current survey object whenever the current survey ID changes from the currently loaded survey.
   */
  useEffect(() => {
    if (surveyId && surveyId !== surveyDataLoader.data?.surveyData.survey_details.id) {
      surveyDataLoader.refresh(surveyId);
      artifactDataLoader.refresh(surveyId);
      critterDataLoader.refresh(surveyId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyId]);

  const surveyContext: ISurveyContext = useMemo(() => {
    return {
      surveyDataLoader,
      artifactDataLoader,
      critterDataLoader,
      surveyId
    };
  }, [surveyDataLoader, artifactDataLoader, critterDataLoader, surveyId]);

  return <SurveyContext.Provider value={surveyContext}>{props.children}</SurveyContext.Provider>;
};
