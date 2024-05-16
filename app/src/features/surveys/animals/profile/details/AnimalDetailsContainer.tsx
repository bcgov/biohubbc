import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import AnimalProfileHeader from 'features/surveys/animals/profile/details/components/AnimalProfileHeader';
import { useAnimalPageContext } from 'hooks/useContext';

/**
 * Returns header component for an animal's profile, displayed after selecting an animal
 *
 * @return {*}
 */
export const AnimalDetailsContainer = () => {
  const animalPageContext = useAnimalPageContext();

  if (
    !animalPageContext.selectedAnimal ||
    animalPageContext.critterDataLoader.isLoading ||
    !animalPageContext.critterDataLoader.data
  ) {
    return (
      <Stack spacing={1.5} flexDirection="column" height="100%" maxWidth="100%" flex="1 1 auto">
        <Skeleton variant="rectangular" width={'50%'} height={65} sx={{ p: 2 }} />
        <Skeleton variant="rectangular" width={'50%'} height={59} sx={{ p: 2 }} />
      </Stack>
    );
  }

  return <AnimalProfileHeader critter={animalPageContext.critterDataLoader.data} />;
};
