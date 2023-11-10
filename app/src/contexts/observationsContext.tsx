import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IGetSurveyObservationsResponse } from 'interfaces/useObservationApi.interface';
import { createContext, PropsWithChildren, useContext } from 'react';
import { SurveyContext } from './surveyContext';

/**
 * Context object that stores information about survey observations
 *
 * @export
 * @interface IObservationsContext
 */
export type IObservationsContext = {
  /**
   * Data Loader used for retrieving survey observations
   */
  observationsDataLoader: DataLoader<[], IGetSurveyObservationsResponse, unknown>;
};

export const ObservationsContext = createContext<IObservationsContext>({
  observationsDataLoader: {} as DataLoader<never, IGetSurveyObservationsResponse, unknown>
});

export const ObservationsContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const { projectId, surveyId } = useContext(SurveyContext);

  const biohubApi = useBiohubApi();

  const observationsDataLoader = useDataLoader(() => biohubApi.observation.getObservationRecords(projectId, surveyId));

  observationsDataLoader.load();

  const observationsContext: IObservationsContext = {
    observationsDataLoader
  };

  return <ObservationsContext.Provider value={observationsContext}>{props.children}</ObservationsContext.Provider>;
};
