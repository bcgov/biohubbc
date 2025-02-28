import { PropsWithChildren } from '@react-leaflet/core/lib/component';
import { createContext } from 'react';

export interface ISamplingSiteListContext {
  /**
   * Callback to return the import button for the sample period.
   *
   * @see `SamplingSiteListPeriod`
   * @see `ImportObservationsButton` and `ImportHabitatFeaturesButton`
   *
   * @param {number} surveySamplePeriodId
   * @return {*} {JSX.Element}
   */
  getSamplePeriodImportButton: (surveySamplePeriodId: number) => JSX.Element;
  /**
   * Flag to disable the Sampling Site List UI controls.
   *
   * @type {boolean}
   */
  isDisabled?: boolean;
}

type ISamplingSiteListContextProviderProps = ISamplingSiteListContext & PropsWithChildren;

export const SamplingSiteListContext = createContext<ISamplingSiteListContext | undefined>(undefined);

/**
 * Provider for the Sampling Site List Context
 *
 * Why? Observations and Habitat Features have a similar UI pattern for importing data. This context
 * provides a way to share the UI pattern between the two features, while allowing for custom
 * import button functionality.
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
