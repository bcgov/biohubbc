import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import React from 'react';

export interface IErrorDialogProps {
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IErrorDialogProps
   */
  dialogTitle: string;
  /**
   * The dialog window body text.
   *
   * @type {string}
   * @memberof IErrorDialogProps
   */
  dialogText: string;
  /**
   * The dialog window body error (optional).
   *
   * @type {string}
   * @memberof IErrorDialogProps
   */
  dialogError?: string;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IErrorDialogProps
   */
  open: boolean;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IErrorDialogProps
   */
  onClose: () => void;
  /**
   * Callback fired if the 'Ok' button is clicked.
   *
   * @memberof IErrorDialogProps
   */
  onOk: () => void;
}

/**
 * A dialog for displaying a title + message + optional error message, and just giving the user an `Ok` button to
 * aknowledge it.
 *
 * @param {*} props
 * @return {*}
 */
export const ErrorDialog: React.FC<IErrorDialogProps> = (props) => {
  return (
    <Box>
      <Dialog
        open={props.open}
        onClose={props.onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{props.dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{props.dialogText}</DialogContentText>
        </DialogContent>
        {props.dialogError && (
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{props.dialogError}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={props.onOk} color="primary" autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
