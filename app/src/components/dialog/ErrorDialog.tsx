import { ListItem } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
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
   * The dialog window human friendly error (optional).
   *
   * @type {string}
   * @memberof IErrorDialogProps
   */
  dialogError?: string;
  /**
   * The dialog window technical error details (optional).
   *
   * @type {((string | object)[])}
   * @memberof IErrorDialogProps
   */
  dialogErrorDetails?: (string | object)[];
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
 * acknowledge it.
 *
 * @param {*} props
 * @return {*}
 */
export const ErrorDialog = (props: IErrorDialogProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const ErrorDetailsList = (errorProps: { errors: (string | object)[] }) => {
    const items = errorProps.errors.map((error, index) => (
      <ListItem key={index} sx={{ p: 0 }}>
        {JSON.stringify(error, null, 2)}
      </ListItem>
    ));

    return <List sx={{ p: 0 }}>{items}</List>;
  };

  if (!props.open) {
    return <></>;
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      keepMounted={false}>
      <DialogTitle id="alert-dialog-title">{props.dialogTitle}</DialogTitle>

      <DialogContent>
        <Stack gap={2}>
          <DialogContentText id="alert-dialog-description">{props.dialogText}</DialogContentText>
          {props.dialogError && (
            <DialogContentText id="alert-dialog-description">{props.dialogError}</DialogContentText>
          )}

          {props?.dialogErrorDetails?.length ? (
            <Box>
              <Link color="primary" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? 'Hide detailed error message' : 'Show detailed error message'}
              </Link>
              <Collapse in={isExpanded}>
                <ErrorDetailsList errors={props.dialogErrorDetails} />
              </Collapse>
            </Box>
          ) : (
            <></>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={props.onOk} color="primary" variant="contained" autoFocus>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};
