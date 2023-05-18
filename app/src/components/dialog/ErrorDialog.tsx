import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';
import DialogVisual from './DialogVisual';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => ({
  dialogTitle: {
    textAlign: 'center',
  },
  visualHidden: {
    textAlign: 'unset'
  }
}));

const DEFAULT_ERROR_DIALOG_TITLE = 'Error!'

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
   * If set, hides the Dialog Visual shown by the error dialog.
   *
   * @type {boolean}
   * @memberof IErrorDialogProps
   */
  hideVisual?: boolean;
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
export const ErrorDialog: React.FC<IErrorDialogProps> = (props) => {
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const ErrorDetailsList = (errorProps: { errors: (string | object)[] }) => {
    const items = errorProps.errors.map((error, index) => {
      if (typeof error === 'string') {
        return <li key={index}>{error}</li>;
      }

      return <li key={index}>{JSON.stringify(error)}</li>;
    });

    return <ul>{items}</ul>;
  };

  return (
    <Box>
      <Dialog
        open={props.open}
        onClose={props.onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        keepMounted={false}>
        {!props.hideVisual && (
          <DialogVisual severity='error' />
        )}

        <DialogTitle id="alert-dialog-title" className={clsx(classes.dialogTitle, { [classes.visualHidden]: props.hideVisual })}>
          {props.dialogTitle || DEFAULT_ERROR_DIALOG_TITLE}
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-description">{props.dialogText}</DialogContentText>
        </DialogContent>

        {props.dialogError && (
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{props.dialogError}</DialogContentText>
            {!!props?.dialogErrorDetails?.length && (
              <>
                <Button color="primary" onClick={() => setIsExpanded(!isExpanded)}>
                  {(isExpanded && 'Hide detailed error message') || 'Show detailed error message'}
                </Button>
                <Collapse in={isExpanded}>
                  <ErrorDetailsList errors={props.dialogErrorDetails} />
                </Collapse>
              </>
            )}
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={props.onOk} color="primary" variant="contained" autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
