import Button from '@mui/material/Button';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { ObservationsTableI18N } from 'constants/i18n';
import { useObservationTableContext } from 'hooks/useContext';
import { useState } from 'react';

export const DiscardChangesButton = () => {
  const observationsTableContext = useObservationTableContext();

  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => setOpen(true)}
        disabled={observationsTableContext.isSaving}>
        Discard Changes
      </Button>
      <YesNoDialog
        dialogTitle={ObservationsTableI18N.removeAllDialogTitle}
        dialogText={ObservationsTableI18N.removeAllDialogText}
        yesButtonProps={{ color: 'error' }}
        yesButtonLabel={'Discard Changes'}
        noButtonProps={{ color: 'primary', variant: 'outlined' }}
        noButtonLabel={'Cancel'}
        open={open}
        onYes={() => {
          setOpen(false);
          observationsTableContext.revertObservationRecords();
        }}
        onClose={() => setOpen(false)}
        onNo={() => setOpen(false)}
      />
    </>
  );
};
