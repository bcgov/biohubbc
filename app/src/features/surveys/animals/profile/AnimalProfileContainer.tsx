import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { AnimalDetailsContainer } from 'features/surveys/animals/profile/details/AnimalDetailsContainer';
import { AnimalCaptureContainer } from './captures/AnimalCaptureContainer';
import AnimalMortalityContainer from './mortality/AnimalMortalityContainer';

/**
 * Component for displaying an animal's details within the Manage Animals page
 *
 * @return {*}
 */
export const AnimalProfileContainer = () => {
  return (
    <Stack spacing={1.5} flexDirection="column" height="100%" maxWidth="100%" flex="1 1 auto">
      <Paper sx={{ p: 2 }}>
        <AnimalDetailsContainer />
      </Paper>
      <Paper>
        <AnimalCaptureContainer />
      </Paper>
      <Paper>
        <AnimalMortalityContainer />
      </Paper>
    </Stack>
  );
};
