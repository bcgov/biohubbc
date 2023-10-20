import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { createContext, PropsWithChildren, useMemo } from 'react';

/**
 * Context object that stores information about codes
 *
 * @export
 * @interface ICodesContext
 */
export interface ICodesContext {
  /**
   * The Data Loader used to load codes
   *
   * @type {DataLoader<[], IGetAllCodeSetsResponse, unknown>}
   * @memberof ICodesContext
   */
  codesDataLoader: DataLoader<[], IGetAllCodeSetsResponse, unknown>;
}

export const CodesContext = createContext<ICodesContext>({
  codesDataLoader: {} as DataLoader<never, IGetAllCodeSetsResponse, unknown>
});

export const CodesContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const biohubApi = useBiohubApi();
  const codesDataLoader = useDataLoader(biohubApi.codes.getAllCodeSets);

  const codesContext: ICodesContext = useMemo(() => ({ codesDataLoader }), [codesDataLoader]);

  return <CodesContext.Provider value={codesContext}>{props.children}</CodesContext.Provider>;
};
