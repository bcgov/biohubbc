import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import React from 'react';

export interface IYesNoDialogProps {
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IYesNoDialogProps
   */
  dialogTitle: string;
  /**
   * The dialog window body text.
   *
   * @type {string}
   * @memberof IYesNoDialogProps
   */
  dialogText: string;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IYesNoDialogProps
   */
  open: boolean;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IYesNoDialogProps
   */
  onClose: () => void;
  /**
   * Callback fired if the 'No' button is clicked.
   *
   * @memberof IYesNoDialogProps
   */
  onNo: () => void;
  /**
   * Callback fired if the 'Yes' button is clicked.
   *
   * @memberof IYesNoDialogProps
   */
  onYes: () => void;
}

const YesNoDialog: React.FC<IYesNoDialogProps> = (props) => {
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
        <DialogActions>
          <Button onClick={props.onNo} color="primary">
            No
          </Button>
          <Button onClick={props.onYes} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default YesNoDialog;
