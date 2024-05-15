import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import AnimalProfileHeader from './AnimalProfileHeader';
import AnimalCaptureContainer from './captures/AnimalCaptureContainer';

/**
 * Component for displaying an animal's details within the Manage Animals page
 *
 * @returns
 */
export const AnimalProfile = () => {
  return (
    <Stack spacing={1.5} flexDirection="column">
      <Paper sx={{ p: 2, flex: '1 1 auto', maxWidth: '100%', width: '100%' }}>
        <AnimalProfileHeader />
      </Paper>
      <Paper>
        <AnimalCaptureContainer />
      </Paper>
    </Stack>
  );
};
