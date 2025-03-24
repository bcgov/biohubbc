import {
  IObservationFormContext,
  ObservationFormContext
} from 'features/surveys/observations/form/components/context/ObservationFormContext';
import { useContext } from 'react';

/**
 * Returns an instance of `IObservationFormContext` from `ObservationFormContext`.
 *
 * @return {*}  {IObservationFormContext}
 */
export const useObservationFormContext = (): IObservationFormContext => {
  const context = useContext(ObservationFormContext);

  if (!context) {
    throw Error(
      'ObservationFormContext is undefined, please verify you are calling useObservationFormContext() as child of an <ObservationFormContextProvider> component.'
    );
  }

  return context;
};
