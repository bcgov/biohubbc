import { mdiCogOutline, mdiFloppy, mdiPlus, mdiTrashCan } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { ObservationsTableI18N } from 'constants/i18n';
import { ObservationsContext } from 'contexts/observationsContext';
import ObservationsTable from 'features/surveys/observations/ObservationsTable';
import { useContext, useState } from 'react';

const ObservationComponent = () => {
  const observationsContext = useContext(ObservationsContext);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showConfirmRemoveAllDialog, setShowConfirmRemoveAllDialog] = useState<boolean>(false);

  const handleSaveChanges = () => {
    setIsSaving(true);

    observationsContext.saveRecords().finally(() => {
      setIsSaving(false);
    });
  };

  const showSaveButton = observationsContext.hasUnsavedChanges();

  return (
    <>
      <YesNoDialog
        dialogTitle={ObservationsTableI18N.removeAllDialogTitle}
        dialogText={ObservationsTableI18N.removeAllDialogTitle}
        yesButtonProps={{ color: 'error' }}
        yesButtonLabel={'Discard Changes'}
        noButtonProps={{ color: 'primary', variant: 'contained' }}
        noButtonLabel={'Cancel'}
        open={showConfirmRemoveAllDialog}
        onYes={() => {
          setShowConfirmRemoveAllDialog(false);
          observationsContext.revertRecords();
        }}
        onClose={() => setShowConfirmRemoveAllDialog(false)}
        onNo={() => setShowConfirmRemoveAllDialog(false)}
      />
      <Box
        display="flex"
        flexDirection="column"
        flex="1 1 auto"
        sx={{
          overflow: 'hidden'
        }}>
        <Toolbar
          sx={{
            flex: '0 0 auto',
            borderBottom: '1px solid #ccc',
            '& Button + Button': {
              ml: 1
            }
          }}>
          <Typography
            sx={{
              flexGrow: '1'
            }}>
            <strong>Observations</strong>
          </Typography>
          {showSaveButton && (
            <>
              <LoadingButton
                loading={isSaving}
                variant="contained"
                color="primary"
                startIcon={<Icon path={mdiFloppy} size={1} />}
                onClick={() => handleSaveChanges()}>
                Save
              </LoadingButton>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Icon path={mdiTrashCan} size={1} />}
                onClick={() => setShowConfirmRemoveAllDialog(true)}>
                Discard Changes
              </Button>
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => observationsContext.createNewRecord()}>
            Add Record
          </Button>
          <Button
            variant="outlined"
            sx={{
              mr: -1
            }}
            startIcon={<Icon path={mdiCogOutline} size={1} />}>
            Configure
          </Button>
        </Toolbar>
        <Box display="flex" flexDirection="column" flex="1 1 auto">
          <ObservationsTable />
        </Box>
      </Box>
    </>
  );
};

export default ObservationComponent;
