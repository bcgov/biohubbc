import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { createContext, PropsWithChildren, useMemo } from 'react';

/**
 * Context object that stores information about survey observations
 *
 * @export
 * @interface IObservationsContext
 */
export type IObservationsContext = {
  //
}

export const ObservationsContext = createContext<IObservationsContext>({
  //
});

export const ObservationsContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const biohubApi = useBiohubApi();
  const observationsDataLoader = useDataLoader(biohubApi.observation.getObservationSubmission);
  


  const observationsContext: IObservationsContext = useMemo(() => {
    return {
      
    };
  }, [observationsDataLoader]);

  return (
    <ObservationsContext.Provider value={observationsContext}>
      {props.children}
    </ObservationsContext.Provider>
    );
};
