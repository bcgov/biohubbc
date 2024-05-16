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

  const handleDelete = async (selectedCapture: string, critterbase_critter_id: string) => {
    await critterbaseApi.capture.deleteCapture(selectedCapture);
    animalPageContext.critterDataLoader.refresh(critterbase_critter_id);
  };

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
