import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { ICritterDetailedResponse } from 'interfaces/useCritterApi.interface';
import isEqual from 'lodash-es/isEqual';
import { createContext, PropsWithChildren, useCallback, useMemo, useState } from 'react';

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
  selectedAnimal: ISurveyCritter | undefined;
  setSelectedAnimal: (selectedAnimal?: ISurveyCritter) => void;
  critterDataLoader: DataLoader<[critterbase_critter_id: string], ICritterDetailedResponse, unknown>;
  setSelectedAnimalFromSurveyCritterId: (selectedAnimalFromSurveyCritterId: number) => void;
};

/**
 * Context for the Manage Animals page
 */
export const AnimalPageContext = createContext<IAnimalPageContext | undefined>(undefined);

/**
 * Provider for the AnimalPageContext
 *
 * @param {PropsWithChildren<Record<never, any>>} props
 * @return {*}
 */
export const AnimalPageContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const biohubApi = useBiohubApi();

  const critterbaseApi = useCritterbaseApi();

  const { surveyId, projectId } = useSurveyContext();

  const surveyCrittersDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCritters(projectId, surveyId));

  const critterDataLoader = useDataLoader((critterId: string) => critterbaseApi.critters.getDetailedCritter(critterId));

  if (!surveyCrittersDataLoader.data) {
    // Load basic data for all critters in the survey
    surveyCrittersDataLoader.load();
  }

  // The currently selected animal
  const [selectedAnimal, setSelectedAnimal] = useState<ISurveyCritter | undefined>();

  const _setSelectedAnimal = useCallback(
    (animal?: ISurveyCritter) => {
      if (isEqual(animal, selectedAnimal)) {
        // No change
        return;
      }

      // Update the selected animal
      setSelectedAnimal(animal);

      if (animal) {
        // Load the critter data for the new animal
        critterDataLoader.refresh(animal.critterbase_critter_id);
      }
    },
    [selectedAnimal, critterDataLoader]
  );

  const setSelectedAnimalFromSurveyCritterId = useCallback(
    (surveyCritterId: number) => {
      if (selectedAnimal?.survey_critter_id === surveyCritterId) {
        // No change
        return;
      }

      const critter = surveyCrittersDataLoader.data?.find((critter) => critter.survey_critter_id === surveyCritterId);

      if (critter) {
        _setSelectedAnimal({
          survey_critter_id: critter.survey_critter_id,
          critterbase_critter_id: critter.critter_id
        });
      }
    },
    [selectedAnimal?.survey_critter_id, surveyCrittersDataLoader.data, _setSelectedAnimal]
  );

  const animalPageContext: IAnimalPageContext = useMemo(
    () => ({
      selectedAnimal,
      setSelectedAnimal: _setSelectedAnimal,
      critterDataLoader,
      setSelectedAnimalFromSurveyCritterId
    }),
    [selectedAnimal, _setSelectedAnimal, critterDataLoader, setSelectedAnimalFromSurveyCritterId]
  );

  return <AnimalPageContext.Provider value={animalPageContext}>{props.children}</AnimalPageContext.Provider>;
};