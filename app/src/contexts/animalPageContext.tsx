import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
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
  selectedAnimal: ISurveyCritter | null;
  setSelectedAnimal: (selectedAnimal: ISurveyCritter | null) => void;
  critterDataLoader: DataLoader<[critterbase_critter_id: string], ICritterDetailedResponse, unknown>;
  selectedAnimalFromSurveyCritterId: number | null;
  setSelectedAnimalFromSurveyCritterId: (selectedAnimalFromSurveyCritterId: number) => void;
};

/**
 * Context for the Manage Animals page
 *
 */
export const AnimalPageContext = createContext<IAnimalPageContext | undefined>(undefined);

export const AnimalPageContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const critterbaseApi = useCritterbaseApi();
  const biohubApi = useBiohubApi();

  const { surveyId, projectId } = useSurveyContext();

  const critterDataLoader = useDataLoader(critterbaseApi.critters.getDetailedCritter);
  const surveyCrittersDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCritters(projectId, surveyId));

  if (!surveyCrittersDataLoader.data) {
    surveyCrittersDataLoader.load();
  }

  /**
   * Keeps track of which animal has been selected from the animal list for view
   *
   */
  const [selectedAnimal, setSelectedAnimal] = useState<ISurveyCritter | null>(null);

  /**
   * Used to set selectedAnimal from just surveyCritterId. When set, it triggers a query for the animal's
   * Critterbase ID to then update selectedAnimal and subsequently refresh the critterDataLoader.
   *
   * This is included so that selectedAnimal can be set by only knowing the Survey Critter ID from the URL params.
   *
   */
  const [selectedAnimalFromSurveyCritterId, setSelectedAnimalFromSurveyCritterId] = useState<number | null>(null);

  useEffect(() => {
    if (surveyCrittersDataLoader.data) {
      const critter = surveyCrittersDataLoader.data.find(
        (critter) => critter.survey_critter_id === selectedAnimalFromSurveyCritterId
      );

      if (critter?.critter_id && selectedAnimalFromSurveyCritterId) {
        animalPageContext.setSelectedAnimal({
          survey_critter_id: selectedAnimalFromSurveyCritterId,
          critterbase_critter_id: critter?.critter_id
        });
      }
    }
  }, [selectedAnimalFromSurveyCritterId, surveyCrittersDataLoader.data]);

  /**
   * Refreshes the animal's profile when selectedAnimal changes
   *
   */
  useEffect(() => {
    if (selectedAnimal) {
      critterDataLoader.refresh(selectedAnimal.critterbase_critter_id);
    }
  }, [selectedAnimal]);

  const animalPageContext: IAnimalPageContext = useMemo(
    () => ({
      selectedAnimal,
      setSelectedAnimal,
      critterDataLoader,
      selectedAnimalFromSurveyCritterId,
      setSelectedAnimalFromSurveyCritterId
    }),
    [
      selectedAnimal,
      critterDataLoader,
      selectedAnimalFromSurveyCritterId,
      setSelectedAnimalFromSurveyCritterId,
      setSelectedAnimal
    ]
  );

  return <AnimalPageContext.Provider value={animalPageContext}>{props.children}</AnimalPageContext.Provider>;
};
