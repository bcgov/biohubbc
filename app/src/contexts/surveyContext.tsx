import { IAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IGetSummaryResultsResponse } from 'interfaces/useSummaryResultsApi.interface';
import {
  IGetSampleSiteResponse,
  IGetSurveyAttachmentsResponse,
  IGetSurveyForViewResponse,
  ISimpleCritterWithInternalId
} from 'interfaces/useSurveyApi.interface';
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
   * The Data Loader used to load survey summary submission data
   *
   * @type {DataLoader<[project_id: number, survey_id: number], IGetSummaryResultsResponse, unknown>}
   * @memberof ISurveyContext
   */
  summaryDataLoader: DataLoader<[project_id: number, survey_id: number], IGetSummaryResultsResponse, unknown>;

  /**
   * The Data Loader used to load survey data
   *
   * @type {DataLoader<[project_id: number, survey_id: number], IGetSurveyAttachmentsResponse, unknown>}
   * @memberof ISurveyContext
   */
  artifactDataLoader: DataLoader<[project_id: number, survey_id: number], IGetSurveyAttachmentsResponse, unknown>;

  /**
   * The Data Loader used to load survey sample site data
   *
   * @type {DataLoader<[project_id: number, survey_id: number], IGetSampleSiteResponse, unknown>}
   * @memberof ISurveyContext
   */
  sampleSiteDataLoader: DataLoader<[project_id: number, survey_id: number], IGetSampleSiteResponse, unknown>;

  deploymentDataLoader: DataLoader<[project_id: number, survey_id: number], IAnimalDeployment[], unknown>;

  /**
   * The Data Loader used to load critters for a given survey
   *
   * @type {DataLoader<[project_id: number, survey_id: number], IDetailedCritterWithInternalId[], unknown>}
   * @memberof ISurveyContext
   */
  critterDataLoader: DataLoader<[project_id: number, survey_id: number], ISimpleCritterWithInternalId[], unknown>;

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
  summaryDataLoader: {} as DataLoader<[project_id: number, survey_id: number], IGetSummaryResultsResponse, unknown>,
  artifactDataLoader: {} as DataLoader<[project_id: number, survey_id: number], IGetSurveyAttachmentsResponse, unknown>,
  sampleSiteDataLoader: {} as DataLoader<[project_id: number, survey_id: number], IGetSampleSiteResponse, unknown>,
  deploymentDataLoader: {} as DataLoader<[project_id: number, survey_id: number], IAnimalDeployment[], unknown>,
  critterDataLoader: {} as DataLoader<[project_id: number, survey_id: number], ISimpleCritterWithInternalId[], unknown>,
  projectId: -1,
  surveyId: -1
});

export const SurveyContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const biohubApi = useBiohubApi();
  const surveyDataLoader = useDataLoader(biohubApi.survey.getSurveyForView);
  const summaryDataLoader = useDataLoader(biohubApi.survey.getSurveySummarySubmission);
  const artifactDataLoader = useDataLoader(biohubApi.survey.getSurveyAttachments);
  const sampleSiteDataLoader = useDataLoader(biohubApi.samplingSite.getSampleSites);
  const deploymentDataLoader = useDataLoader(biohubApi.survey.getDeploymentsInSurvey);
  const critterDataLoader = useDataLoader(biohubApi.survey.getSurveyCritters);

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
  summaryDataLoader.load(projectId, surveyId);
  artifactDataLoader.load(projectId, surveyId);
  sampleSiteDataLoader.load(projectId, surveyId);
  deploymentDataLoader.load(projectId, surveyId);
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
      summaryDataLoader.refresh(projectId, surveyId);
      artifactDataLoader.refresh(projectId, surveyId);
      sampleSiteDataLoader.refresh(projectId, surveyId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, surveyId]);

  const surveyContext: ISurveyContext = useMemo(() => {
    return {
      surveyDataLoader,
      summaryDataLoader,
      artifactDataLoader,
      sampleSiteDataLoader,
      critterDataLoader,
      deploymentDataLoader,
      projectId,
      surveyId
    };
  }, [
    surveyDataLoader,
    summaryDataLoader,
    artifactDataLoader,
    sampleSiteDataLoader,
    critterDataLoader,
    deploymentDataLoader,
    projectId,
    surveyId
  ]);

  return <SurveyContext.Provider value={surveyContext}>{props.children}</SurveyContext.Provider>;
};
