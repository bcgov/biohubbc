import { Divider } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { AnimalDetailsContainer } from 'features/surveys/animals/profile/details/AnimalDetailsContainer';
import { useAnimalPageContext } from 'hooks/useContext';
import { AnimalCaptureContainer } from './captures/AnimalCaptureContainer';
import AnimalMortalityContainer from './mortality/AnimalMortalityContainer';
import { AnimalSpatialContainer } from './spatial/AnimalSpatialContainer';

/**
 * Component for displaying an animal's details (profile) within the Manage Animals page
 *
 * @return {*}
 */
export const AnimalProfileContainer = () => {
  const animalPageContext = useAnimalPageContext();
  const data = animalPageContext.critterDataLoader.data;
  const captures = data?.captures || [];
  const mortalities = data?.mortality || [];

  return (
    <Stack spacing={0} flexDirection="column" height="100%" maxWidth="100%" flex="1 1 auto">
      <Box>
        <AnimalDetailsContainer />
      </Box>
      <Box px={2}>
        <AnimalSpatialContainer captures={captures} mortalities={mortalities} />
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box px={2}>
        <AnimalCaptureContainer />
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box px={2}>
        <AnimalMortalityContainer />
      </Box>
      <Divider sx={{ my: 2 }} />
    </Stack>
  );
};
