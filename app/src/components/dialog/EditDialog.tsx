import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import React from 'react';

export interface IEditDialogProps {
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IEditDialogProps
   */
  dialogTitle: string;
  /**
   * The dialog window body text.
   *
   * @type {string}
   * @memberof IEditDialogProps
   */
  dialogText: string;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IEditDialogProps
   */
  open: boolean;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IEditDialogProps
   */
  onClose: () => void;
  /**
   * Callback fired if the 'No' button is clicked.
   *
   * @memberof IEditDialogProps
   */
  onCancel: () => void;
  /**
   * Callback fired if the 'Yes' button is clicked.
   *
   * @memberof IEditDialogProps
   */
  onSave: () => void;

  component: any;
}

/**
 * A dialog for displaying a title + message (typically a question), and giving the user the option to say
 * `Yes` or `No`.
 *
 * @param {*} props
 * @return {*}
 */
const EditDialog: React.FC<IEditDialogProps> = (props) => {
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
          {props.component}
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onCancel} color="primary">
            No
          </Button>
          <Button onClick={props.onSave} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditDialog;
