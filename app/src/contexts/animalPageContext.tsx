import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { ICritterDetailedResponse } from 'interfaces/useCritterApi.interface';
import { createContext, PropsWithChildren, useCallback, useMemo, useRef } from 'react';

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
 *
 */
export const AnimalPageContext = createContext<IAnimalPageContext | undefined>(undefined);

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
  const selectedAnimal = useRef<ISurveyCritter | undefined>();

  /**
   * Used to set selectedAnimal from just surveyCritterId. When set, it triggers a query for the animal's
   * Critterbase ID to then update selectedAnimal and subsequently refresh the critterDataLoader.
   *
   * This is included so that selectedAnimal can be set by only knowing the Survey Critter ID from the URL params.
   *
   */
  //   const [selectedAnimalFromSurveyCritterId, setSelectedAnimalFromSurveyCritterId] = useState<number | null>(null);

  //   useEffect(() => {
  //     if (surveyCrittersDataLoader.data) {
  //       const critter = surveyCrittersDataLoader.data.find(
  //         (critter) => critter.survey_critter_id === selectedAnimalFromSurveyCritterId
  //       );

  //       if (critter?.critter_id && selectedAnimalFromSurveyCritterId) {
  //         animalPageContext.setSelectedAnimal({
  //           survey_critter_id: selectedAnimalFromSurveyCritterId,
  //           critterbase_critter_id: critter?.critter_id
  //         });
  //       }
  //     }
  //   }, [selectedAnimalFromSurveyCritterId, surveyCrittersDataLoader.data]);

  const setSelectedAnimal = useCallback(
    (animal?: ISurveyCritter) => {
      if (animal === selectedAnimal.current) {
        // No change
        return;
      }

      // Update the selected animal
      selectedAnimal.current = animal;

      if (animal) {
        // Load the critter data for the new animal
        critterDataLoader.refresh(animal.critterbase_critter_id);
      }
    },
    [critterDataLoader]
  );

  const setSelectedAnimalFromSurveyCritterId = useCallback(
    (surveyCritterId: number) => {
      if (selectedAnimal.current?.survey_critter_id === surveyCritterId) {
        // No change
        return;
      }

      const critter = surveyCrittersDataLoader.data?.find((critter) => critter.survey_critter_id === surveyCritterId);

      if (critter) {
        setSelectedAnimal({
          survey_critter_id: critter.survey_critter_id,
          critterbase_critter_id: critter.critter_id
        });
      }
    },
    [surveyCrittersDataLoader.data, setSelectedAnimal]
  );

  const animalPageContext: IAnimalPageContext = useMemo(
    () => ({
      selectedAnimal: selectedAnimal.current,
      setSelectedAnimal,
      critterDataLoader,
      setSelectedAnimalFromSurveyCritterId
    }),
    [setSelectedAnimal, critterDataLoader, setSelectedAnimalFromSurveyCritterId]
  );

  return <AnimalPageContext.Provider value={animalPageContext}>{props.children}</AnimalPageContext.Provider>;
};
