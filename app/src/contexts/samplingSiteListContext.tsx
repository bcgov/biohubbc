import { PropsWithChildren } from '@react-leaflet/core/lib/component';
import { createContext } from 'react';

export interface ISamplingSiteListContext {
  getSamplePeriodImportButton: (surveySamplePeriodId: number) => JSX.Element;
}

type ISamplingSiteListContextProviderProps = ISamplingSiteListContext & PropsWithChildren;

export const SamplingSiteListContext = createContext<ISamplingSiteListContext | undefined>(undefined);

/**
 * Provider for the Sampling Site List Context
 *
 * @param {ISamplingSiteListContextProviderProps} props
 * @return {*} {JSX.Element}
 */
export const SamplingSiteListProvider = (props: ISamplingSiteListContextProviderProps) => {
  return (
    <SamplingSiteListContext.Provider
      value={{
        getSamplePeriodImportButton: props.getSamplePeriodImportButton
      }}>
      {props.children}
    </SamplingSiteListContext.Provider>
  );
};
