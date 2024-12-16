import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { GetSurveyTelemetryResponse } from 'interfaces/useTelemetryApi.interface';
import { GetSurveyDeploymentsResponse } from 'interfaces/useTelemetryDeploymentApi.interface';

import { createContext, PropsWithChildren, useContext } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Context object that stores information about survey telemetry
 *
 * @export
 * @interface ITelemetryContext
 */
export type ITelemetryContext = {
  /**
   * Data Loader used for retrieving survey deployments records.
   */
  deploymentDataLoader: DataLoader<[pagination?: ApiPaginationRequestOptions], GetSurveyDeploymentsResponse, unknown>;
  /**
   * Data Loader used for retrieving survey telemetry records.
   */
  telemetryDataLoader: DataLoader<[pagination?: ApiPaginationRequestOptions], GetSurveyTelemetryResponse, unknown>;
};

export const TelemetryContext = createContext<ITelemetryContext | undefined>(undefined);

export const TelemetryContextProvider = (props: PropsWithChildren) => {
  const { projectId, surveyId } = useContext(SurveyContext);

  const biohubApi = useBiohubApi();

  const deploymentDataLoader = useDataLoader((pagination?: ApiPaginationRequestOptions) =>
    biohubApi.telemetryDeployment.getDeploymentsInSurvey(projectId, surveyId, pagination)
  );

  const telemetryDataLoader = useDataLoader((pagination?: ApiPaginationRequestOptions) =>
    biohubApi.telemetry.getTelemetryForSurvey(projectId, surveyId, pagination)
  );

  const telemetryContext: ITelemetryContext = {
    deploymentDataLoader,
    telemetryDataLoader
  };

  return <TelemetryContext.Provider value={telemetryContext}>{props.children}</TelemetryContext.Provider>;
};
