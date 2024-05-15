import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { SkeletonHorizontalStack } from 'components/loading/SkeletonLoaders';
import { useAnimalPageContext, useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import AnimalCaptureCardContainer from './components/AnimalCaptureCardContainer';
import AnimalCapturesMap from './components/AnimalCapturesMap';
import AnimalCapturesToolbar from './components/AnimalCapturesToolbar';

/**
 * Container for the animal captures map component within the animal profile page
 *
 * @returns
 */
const AnimalCaptureContainer = () => {
  const critterbaseApi = useCritterbaseApi();

  const { selectedAnimal, critterDataLoader } = useAnimalPageContext();

  const { projectId, surveyId } = useSurveyContext();

  const handleDelete = async (selectedCapture: string, critterbase_critter_id: string) => {
    await critterbaseApi.capture.deleteCapture(selectedCapture);
    critterDataLoader.refresh(critterbase_critter_id);
  };

  if (!selectedAnimal || !critterDataLoader.data) {
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

  const captures = critterDataLoader.data.captures;

  return (
    <>
      <AnimalCapturesToolbar
        capturesCount={captures.length}
        createCaptureRoute={`/admin/projects/${projectId}/surveys/${surveyId}/animals/${selectedAnimal.survey_critter_id}/capture/create`}
      />
      <AnimalCapturesMap captures={captures} isLoading={false} />
      <AnimalCaptureCardContainer captures={captures} selectedAnimal={selectedAnimal} handleDelete={handleDelete} />
    </>
  );
};

export default AnimalCaptureContainer;
