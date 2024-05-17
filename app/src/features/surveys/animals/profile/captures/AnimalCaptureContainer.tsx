import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { SkeletonHorizontalStack } from 'components/loading/SkeletonLoaders';
import { useAnimalPageContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { useHistory } from 'react-router';
import AnimalCaptureCardContainer from './components/AnimalCaptureCardContainer';
import AnimalCapturesMap from './components/AnimalCapturesMap';
import AnimalCapturesToolbar from './components/AnimalCapturesToolbar';

/**
 * Container for the animal captures map component within the animal profile page
 *
 * @return {*}
 */
export const AnimalCaptureContainer = () => {
  const critterbaseApi = useCritterbaseApi();

  const history = useHistory();

  const { projectId, surveyId } = useSurveyContext();

  const animalPageContext = useAnimalPageContext();

  if (!animalPageContext.selectedAnimal || !animalPageContext.critterDataLoader.data) {
    return (
      <Box p={2}>
        <SkeletonHorizontalStack numberOfLines={2} />
        <Skeleton width="100%" height="200px" />
        <Skeleton width="100%" height="50px" />
        <Skeleton width="100%" height="50px" />
        <Skeleton width="100%" height="50px" />
      </Box>
    );
  }

  const captures = animalPageContext.critterDataLoader.data.captures;
  const selectedAnimal = animalPageContext.selectedAnimal;

  const handleDelete = async (selectedCapture: string, critterbase_critter_id: string) => {
    // Delete markings and measurements associated with the capture to avoid foreign key constraint error
    await critterbaseApi.critters.bulkUpdate({
      markings: animalPageContext.critterDataLoader.data?.markings
        .filter((marking) => marking.capture_id === selectedCapture)
        .map((marking) => ({
          ...marking,
          critter_id: selectedAnimal.critterbase_critter_id,
          _delete: true
        })),
      qualitative_measurements:
        animalPageContext.critterDataLoader.data?.measurements.qualitative
          .filter((measurement) => measurement.capture_id === selectedCapture)
          .map((measurement) => ({
            ...measurement,
            measurement_qualitative_id: measurement.measurement_qualitative_id,
            measurement_quantitative_id: undefined,
            measured_timestamp: undefined,
            measurement_comment: undefined,
            value: undefined,
            critter_id: selectedAnimal.critterbase_critter_id,
            _delete: true
          })) ?? [],
      quantitative_measurements:
        animalPageContext.critterDataLoader.data?.measurements.quantitative
          .filter((measurement) => measurement.capture_id === selectedCapture)
          .map((measurement) => ({
            ...measurement,
            measurement_qualitative_id: undefined,
            measurement_quantitative_id: measurement.measurement_quantitative_id,
            measured_timestamp: undefined,
            qualitative_option_id: undefined,
            measurement_comment: undefined,
            value: measurement.value,
            critter_id: selectedAnimal.critterbase_critter_id,
            _delete: true
          })) ?? []
    });

    // Delete the actual capture
    await critterbaseApi.capture.deleteCapture(selectedCapture);

    // Refresh capture container
    animalPageContext.critterDataLoader.refresh(critterbase_critter_id);
  };

  if (!selectedAnimal) {
    return null;
  }

  return (
    <>
      <AnimalCapturesToolbar
        capturesCount={captures.length}
        onAddAnimalCapture={() => {
          history.push(
            `/admin/projects/${projectId}/surveys/${surveyId}/animals/${selectedAnimal.survey_critter_id}/capture/create`
          );
        }}
      />
      <AnimalCapturesMap captures={captures} isLoading={false} />
      <AnimalCaptureCardContainer captures={captures} selectedAnimal={selectedAnimal} handleDelete={handleDelete} />
    </>
  );
};
