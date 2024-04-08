import { createContext, PropsWithChildren, useState } from 'react';

/**
 * Context object that stores information about the survey observations page.
 *
 * @export
 * @interface IObservationsPageContext
 */
export type IObservationsPageContext = {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  isDisabled: boolean;
  setIsDisabled: (isDisabled: boolean) => void;
};

export const ObservationsPageContext = createContext<IObservationsPageContext | undefined>(undefined);

export const ObservationsPageContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  return (
    <ObservationsPageContext.Provider value={{ isLoading, setIsLoading, isDisabled, setIsDisabled }}>
      {props.children}
    </ObservationsPageContext.Provider>
  );
};
