import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { ICritterDeploymentResponse, useTelemetryApi } from 'hooks/useTelemetryApi';
import { IGetObservationSubmissionResponse } from 'interfaces/useDwcaApi.interface';
import { IGetSummaryResultsResponse } from 'interfaces/useSummaryResultsApi.interface';
import {
  IDetailedCritterWithInternalId,
  IGetSampleSiteResponse,
  IGetSurveyAttachmentsResponse,
  IGetSurveyForViewResponse
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
   * The Data Loader used to load survey observation submission data
   *
   * @type {DataLoader<[project_id: number, survey_id: number], IGetObservationSubmissionResponse, unknown>}
   * @memberof ISurveyContext
   */
  observationDataLoader: DataLoader<
    [project_id: number, survey_id: number],
    IGetObservationSubmissionResponse,
    unknown
  >;

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

  /**
   * The Data Loader used to load critter deployments for a given survey
   *
   * @type {DataLoader<[project_id: number, survey_id: number], IGetSampleSiteResponse, unknown>}
   * @memberof ISurveyContext
   */
  critterDeploymentDataLoader: DataLoader<
    [project_id: number, survey_id: number],
    ICritterDeploymentResponse[],
    unknown
  >;

  /**
   * The Data Loader used to load critters for a given survey
   *
   * @type {DataLoader<[project_id: number, survey_id: number], IDetailedCritterWithInternalId[], unknown>}
   * @memberof ISurveyContext
   */
  critterDataLoader: DataLoader<[project_id: number, survey_id: number], IDetailedCritterWithInternalId[], unknown>;

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
  observationDataLoader: {} as DataLoader<
    [project_id: number, survey_id: number],
    IGetObservationSubmissionResponse,
    unknown
  >,
  summaryDataLoader: {} as DataLoader<[project_id: number, survey_id: number], IGetSummaryResultsResponse, unknown>,
  artifactDataLoader: {} as DataLoader<[project_id: number, survey_id: number], IGetSurveyAttachmentsResponse, unknown>,
  sampleSiteDataLoader: {} as DataLoader<[project_id: number, survey_id: number], IGetSampleSiteResponse, unknown>,
  critterDeploymentDataLoader: {} as DataLoader<
    [project_id: number, survey_id: number],
    ICritterDeploymentResponse[],
    unknown
  >,
  critterDataLoader: {} as DataLoader<
    [project_id: number, survey_id: number],
    IDetailedCritterWithInternalId[],
    unknown
  >,
  projectId: -1,
  surveyId: -1
});

export const SurveyContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const biohubApi = useBiohubApi();
  const telemetryApi = useTelemetryApi();
  const surveyDataLoader = useDataLoader(biohubApi.survey.getSurveyForView);
  const observationDataLoader = useDataLoader(biohubApi.dwca.getObservationSubmission);
  const summaryDataLoader = useDataLoader(biohubApi.survey.getSurveySummarySubmission);
  const artifactDataLoader = useDataLoader(biohubApi.survey.getSurveyAttachments);
  const sampleSiteDataLoader = useDataLoader(biohubApi.samplingSite.getSampleSites);
  const critterDeploymentDataLoader = useDataLoader(telemetryApi.getCritterAndDeployments);
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
  observationDataLoader.load(projectId, surveyId);
  summaryDataLoader.load(projectId, surveyId);
  artifactDataLoader.load(projectId, surveyId);
  sampleSiteDataLoader.load(projectId, surveyId);
  critterDeploymentDataLoader.load(projectId, surveyId);
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
      observationDataLoader.refresh(projectId, surveyId);
      summaryDataLoader.refresh(projectId, surveyId);
      artifactDataLoader.refresh(projectId, surveyId);
      sampleSiteDataLoader.refresh(projectId, surveyId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, surveyId]);

  const surveyContext: ISurveyContext = useMemo(() => {
    return {
      surveyDataLoader,
      observationDataLoader,
      summaryDataLoader,
      artifactDataLoader,
      sampleSiteDataLoader,
      critterDeploymentDataLoader,
      critterDataLoader,
      projectId,
      surveyId
    };
  }, [
    surveyDataLoader,
    observationDataLoader,
    summaryDataLoader,
    artifactDataLoader,
    sampleSiteDataLoader,
    critterDeploymentDataLoader,
    critterDataLoader,
    projectId,
    surveyId
  ]);

  return <SurveyContext.Provider value={surveyContext}>{props.children}</SurveyContext.Provider>;
};
