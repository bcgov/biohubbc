import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { ICritterDetailedResponse } from 'interfaces/useCritterApi.interface';
import { createContext, PropsWithChildren, useEffect, useMemo, useState } from 'react';

export interface ISurveyCritter {
  survey_critter_id: number;
  critterbase_critter_id: string;
}

/**
 * Context object that stores information about the survey Animal page.
 *
 * Note: this should only be used for data that is generally applicable to the entire page.
 *
 * @export
 * @interface IAnimalPageContext
 */
export type IAnimalPageContext = {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  isDisabled: boolean;
  setIsDisabled: (isDisabled: boolean) => void;
  selectedAnimal: ISurveyCritter | null;
  setSelectedAnimal: (selectedAnimal: ISurveyCritter | null) => void;
  critterDataLoader: DataLoader<[critterbase_critter_id: string], ICritterDetailedResponse, unknown>;
};

export const AnimalPageContext = createContext<IAnimalPageContext | undefined>(undefined);

export const AnimalPageContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const critterbaseApi = useCritterbaseApi();

  const critterDataLoader = useDataLoader(critterbaseApi.critters.getDetailedCritter);

  /**
   * Keeps track of which animal has been selected in the side panel of the animal page
   */
  const [selectedAnimal, setSelectedAnimal] = useState<ISurveyCritter | null>(null);

  /**
   * Refreshes the current profile whenever the selected critter changes
   */
  useEffect(() => {
    if (selectedAnimal) {
      critterDataLoader.refresh(selectedAnimal.critterbase_critter_id);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnimal]);

  const animalPageContext: IAnimalPageContext = useMemo(
    () => ({
      isLoading,
      setIsLoading,
      isDisabled,
      setIsDisabled,
      selectedAnimal,
      setSelectedAnimal,
      critterDataLoader
    }),
    [selectedAnimal, isLoading, isDisabled, critterDataLoader]
  );

  return <AnimalPageContext.Provider value={animalPageContext}>{props.children}</AnimalPageContext.Provider>;
};
