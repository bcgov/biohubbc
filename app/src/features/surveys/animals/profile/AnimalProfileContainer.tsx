import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useAnimalPageContext } from 'hooks/useContext';
import AnimalProfile from './AnimalProfile';

const AnimalProfileContainer = () => {
  //   const animalPageContext = useAnimalPageContext();

  const { selectedAnimal } = useAnimalPageContext();

  return (
    <Paper component={Stack} flexDirection="column" flex="1 1 auto" height="100%">
      <Toolbar
        disableGutters
        sx={{
          pl: 2,
          pr: 3
        }}>
        <Typography
          sx={{
            flexGrow: '1',
            fontSize: '1.125rem',
            fontWeight: 700
          }}>
          Profile &zwnj;
          {/* <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
            ({animalPageContext.observationCount})
          </Typography> */}
        </Typography>

        <Stack flexDirection="row" alignItems="center" gap={1} whiteSpace="nowrap" bgcolor={grey[100]}>
          {/* <ImportObservationsButton
            disabled={animalPageContext.isSaving || animalPageContext.isDisabled}
            onStart={() => observationsPageContext.setIsDisabled(true)}
            onSuccess={() => animalPageContext.refreshObservationRecords()}
            onFinish={() => observationsPageContext.setIsDisabled(false)}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => animalPageContext.addObservationRecord()}
            disabled={animalPageContext.isSaving || animalPageContext.isDisabled}>
            Add Record
          </Button>
          <Collapse in={animalPageContext.hasUnsavedChanges} orientation="horizontal" sx={{ mr: -1 }}>
            <Box whiteSpace="nowrap" display="flex" sx={{ gap: 1, pr: 1 }}>
              <LoadingButton
                loading={animalPageContext.isSaving || animalPageContext.isDisabled}
                variant="contained"
                color="primary"
                onClick={() => animalPageContext.saveObservationRecords()}
                disabled={animalPageContext.isSaving || animalPageContext.isDisabled}>
                Save
              </LoadingButton>
              <DiscardChangesButton
                disabled={animalPageContext.isSaving || animalPageContext.isDisabled}
                onDiscard={() => animalPageContext.discardChanges()}
              />
            </Box>
          </Collapse>
          <ExportHeadersButton />
          <ConfigureColumnsContainer
            disabled={animalPageContext.isSaving || animalPageContext.isDisabled}
            columns={columns}
          />
          <BulkActionsButton disabled={animalPageContext.isSaving || animalPageContext.isDisabled} /> */}
        </Stack>
      </Toolbar>

      <Divider flexItem></Divider>

      {selectedAnimal && (
        <Box display="flex" flexDirection="column" flex="1 1 auto" position="relative">
          <AnimalProfile />
        </Box>
      )}
    </Paper>
  );
};

export default AnimalProfileContainer;
