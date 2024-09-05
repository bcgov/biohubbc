import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { useAnimalPageContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import {
  IMarkingResponse,
  IMortalityResponse,
  IQualitativeMeasurementResponse,
  IQuantitativeMeasurementResponse
} from 'interfaces/useCritterApi.interface';
import { useHistory } from 'react-router';
import { AnimalMortalityCardContainer } from './components/AnimalMortalityCardContainer';
import { AnimalMortalityMap } from './components/AnimalMortalityMap';
import { AnimalMortalityToolbar } from './components/AnimalMortalityToolbar';

export interface IMortalityWithSupplementaryData extends IMortalityResponse {
  markings: IMarkingResponse[];
  measurements: { qualitative: IQualitativeMeasurementResponse[]; quantitative: IQuantitativeMeasurementResponse[] };
}

/**
 * Container for the animal mortality component within the animal profile page
 *
 * @return {*}
 */
const AnimalMortalityContainer = () => {
  const critterbaseApi = useCritterbaseApi();

  const history = useHistory();

  const { surveyId, projectId } = useSurveyContext();

  const animalPageContext = useAnimalPageContext();

  const data = animalPageContext.critterDataLoader.data;

  if (!animalPageContext.selectedAnimal || animalPageContext.critterDataLoader.isLoading) {
    return (
      <Box flex="1 1 auto" p={2}>
        <Box display="flex" justifyContent="space-between">
          <Skeleton height="25px" width="50px" />
          <Skeleton height="25px" width="150px" />
        </Box>
        <Skeleton height="150px" width="100%"></Skeleton>
      </Box>
    );
  }

  const selectedAnimal = animalPageContext.selectedAnimal;

  if (!selectedAnimal) {
    return null;
  }

  const mortality: IMortalityWithSupplementaryData[] =
    data?.mortality.map((mortality) => ({
      ...mortality,
      markings: data?.markings.filter((marking) => marking.mortality_id === mortality.mortality_id),
      measurements: {
        qualitative: data.measurements.qualitative.filter(
          (measurement) => measurement.mortality_id === mortality.mortality_id
        ),
        quantitative: data.measurements.quantitative.filter(
          (measurement) => measurement.mortality_id === mortality.mortality_id
        )
      }
    })) || [];

  const handleDelete = async (selectedMortality: string, critterId: number) => {
    // Delete markings and measurements associated with the mortality to avoid foreign key constraint error
    await critterbaseApi.critters.bulkUpdate({
      markings: data?.markings
        .filter((marking) => marking.mortality_id === selectedMortality)
        .map((marking) => ({
          ...marking,
          critter_id: selectedAnimal.critterbase_critter_id,
          _delete: true
        })),
      qualitative_measurements:
        data?.measurements.qualitative
          .filter((measurement) => measurement.mortality_id === selectedMortality)
          .map((measurement) => ({
            ...measurement,
            _delete: true
          })) ?? [],
      quantitative_measurements:
        data?.measurements.quantitative
          .filter((measurement) => measurement.mortality_id === selectedMortality)
          .map((measurement) => ({
            ...measurement,
            _delete: true
          })) ?? []
    });

    // Delete the actual mortality
    await critterbaseApi.mortality.deleteMortality(selectedMortality);

    // Refresh mortality container
    if (critterId) {
      animalPageContext.critterDataLoader.refresh(projectId, surveyId, critterId);
    }
  };

  return (
    <>
      <AnimalMortalityToolbar
        mortalityCount={mortality.length}
        onAddAnimalMortality={() => {
          history.push(
            `/admin/projects/${projectId}/surveys/${surveyId}/animals/${selectedAnimal.critter_id}/mortality/create`
          );
        }}
      />
      {mortality.length > 0 && <AnimalMortalityMap mortality={mortality} isLoading={false} />}
      <AnimalMortalityCardContainer mortality={mortality} selectedAnimal={selectedAnimal} handleDelete={handleDelete} />
    </>
  );
};

export default AnimalMortalityContainer;
