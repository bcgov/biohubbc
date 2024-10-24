import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { WarningSchema } from 'interfaces/useBioHubApi.interface';
import { IAllTelemetry, IAnimalDeployment } from 'interfaces/useTelemetryApi.interface';
import { createContext, PropsWithChildren, useMemo } from 'react';

/**
 * Context object that stores information about a survey
 *
 * @export
 * @interface ITelemetryDataContext
 */
export interface ITelemetryDataContext {
  /**
   * The Data Loader used to load deployments.
   *
   * @type {DataLoader<[project_id: number, survey_id: number], { deployments: IAnimalDeployment[]; bad_deployments: WarningSchema<{ sims_deployment_id: number; bctw_deployment_id: string }>[] }, unknown>}
   * @memberof ITelemetryDataContext
   */
  deploymentsDataLoader: DataLoader<
    [project_id: number, survey_id: number],
    {
      deployments: IAnimalDeployment[];
      bad_deployments: WarningSchema<{ sims_deployment_id: number; bctw_deployment_id: string }>[];
    },
    unknown
  >;
  /**
   * The Data Loader used to load telemetry.
   *
   * @type {DataLoader<[deploymentIds: string[]], IAllTelemetry[], unknown>}
   * @memberof ITelemetryDataContext
   */
  telemetryDataLoader: DataLoader<[deploymentIds: string[]], IAllTelemetry[], unknown>;
}

export const TelemetryDataContext = createContext<ITelemetryDataContext | undefined>(undefined);

export const TelemetryDataContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const biohubApi = useBiohubApi();

  const deploymentsDataLoader = useDataLoader(biohubApi.survey.getDeploymentsInSurvey);
  const telemetryDataLoader = useDataLoader(biohubApi.telemetry.getAllTelemetryByDeploymentIds);

  const telemetryDataContext: ITelemetryDataContext = useMemo(() => {
    return {
      deploymentsDataLoader,
      telemetryDataLoader
    };
  }, [deploymentsDataLoader, telemetryDataLoader]);

  return <TelemetryDataContext.Provider value={telemetryDataContext}>{props.children}</TelemetryDataContext.Provider>;
};
