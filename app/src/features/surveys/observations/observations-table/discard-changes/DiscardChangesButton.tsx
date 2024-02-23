import Button from '@mui/material/Button';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { ObservationsTableI18N } from 'constants/i18n';
import { useState } from 'react';

export interface IDiscardChangesButtonProps {
  /**
   * Controls the disabled state of the button.
   *
   * @type {boolean}
   * @memberof IBulkActionsButtonProps
   */
  disabled: boolean;
  /**
   * Callback fired when the user clicks the discard changes button.
   *
   * @memberof IDiscardChangesButtonProps
   */
  onDiscard: () => void;
}

export const DiscardChangesButton = (props: IDiscardChangesButtonProps) => {
  const { disabled, onDiscard } = props;

  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Button variant="outlined" color="primary" onClick={() => setOpen(true)} disabled={disabled}>
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
          onDiscard();
        }}
        onClose={() => setOpen(false)}
        onNo={() => setOpen(false)}
      />
    </>
  );
};
