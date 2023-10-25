import { Typography } from '@mui/material';
import { IDialogContext } from '../contexts/dialogContext';

/**
 * Simple reusable method to make a snackbar appear with a string of your choice.
 *
 * @param message string to show
 * @param context reference to current DialogContext
 */
export const setPopup = (message: string, context: IDialogContext) => {
  context.setSnackbar({
    open: true,
    snackbarMessage: (
      <Typography variant="body2" component="div">
        {message}
      </Typography>
    )
  });
};
