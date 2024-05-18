import Box from '@mui/material/Box';
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
        <Skeleton variant="rectangular" width={'25%'} height={25} sx={{ p: 2 }} />
        <Box display="flex" flexDirection={'row'} justifyContent={'space-between'} pb={1}>
          <Box display="flex" flexDirection={'row'} width="50%">
            <Skeleton variant="circular" height={15} sx={{ p: 1, mr: 1 }} />
            <Skeleton variant="rectangular" width={'15%'} height={15} sx={{ p: 1, mr: 2 }} />
            <Skeleton variant="rounded" width={'15%'} height={15} sx={{ p: 1 }} />
          </Box>
          <Box display="flex" flexDirection={'row-reverse'} width="50%">
            <Skeleton variant="rectangular" width={'75%'} height={15} sx={{ p: 1, mr: 2 }} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" width={'100%'} height={'2px'} />
        <Skeleton variant="rectangular" width={'50%'} height={42} sx={{ p: 2 }} />
      </Stack>
    );
  }

  return <AnimalProfileHeader critter={animalPageContext.critterDataLoader.data} />;
};
