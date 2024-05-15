import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useAnimalPageContext, useSurveyContext } from 'hooks/useContext';
import AnimalProfileHeader from './AnimalProfileHeader';
import AnimalCaptureContainer from './captures/AnimalCaptureContainer';

/**
 * Component for displaying an animal's details within the Manage Animals page
 *
 * @returns
 */
export const AnimalProfile = () => {
  const animalPageContext = useAnimalPageContext();

  const { surveyId, projectId } = useSurveyContext();

  const { critterDataLoader, selectedAnimal } = animalPageContext;

  const critter = critterDataLoader.data;

  if (!critter || critterDataLoader.isLoading || !selectedAnimal) {
    return (
      <Box flex="1 1 auto" display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress size={40} sx={{ flex: '1 1 auto', position: 'absolute' }} />
      </Box>
    );
  }

  return (
    <>
      {selectedAnimal && (
        <Stack spacing={1.5} flexDirection="column" height="100%" maxWidth="100%" flex="1 1 auto">
          <Paper sx={{ p: 2, flex: '1 1 auto', maxWidth: '100%', width: '100%' }}>
            <AnimalProfileHeader critter={critter} />
          </Paper>
          <Paper>
            <AnimalCaptureContainer
              selectedAnimal={selectedAnimal}
              captures={critterDataLoader.data?.captures ?? []}
              isLoading={critterDataLoader.isLoading}
              handleRefresh={() => {
                critterDataLoader.refresh(selectedAnimal.critterbase_critter_id);
              }}
              createCaptureRoute={`/admin/projects/${projectId}/surveys/${surveyId}/animals/${selectedAnimal.survey_critter_id}/capture/create`}
            />
          </Paper>
        </Stack>
      )}
    </>
  );
};
