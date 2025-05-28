import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { AnimalDetailsContainer } from 'features/surveys/animals/profile/details/AnimalDetailsContainer';
import { AnimalCaptureContainer } from './captures/AnimalCaptureContainer';
import AnimalMortalityContainer from './mortality/AnimalMortalityContainer';

/**
 * Component for displaying an animal's details (profile) within the Manage Animals page
 *
 * @return {*}
 */
export const AnimalProfileContainer = () => {
  return (
    <Stack spacing={0} flexDirection="column" height="100%" maxWidth="100%" flex="1 1 auto">
      <Box>
        <AnimalDetailsContainer />
      </Box>
      <Box px={2}>
        <AnimalCaptureContainer />
      </Box>
      <Box px={2}>
        <AnimalMortalityContainer />
      </Box>
    </Stack>
  );
};
