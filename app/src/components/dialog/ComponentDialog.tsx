import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useTheme from '@material-ui/core/styles/useTheme';
import React from 'react';

export interface IComponentDialogProps {
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IComponentDialogProps
   */
  dialogTitle: string;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IComponentDialogProps
   */
  open: boolean;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IComponentDialogProps
   */
  onClose: () => void;
}

/**
 * A dialog to wrap any component(s) that need to be displayed as a modal.
 *
 * Any component(s) passed in `props.children` will be rendered as the content of the dialog.
 *
 * @param {*} props
 * @return {*}
 */
const ComponentDialog: React.FC<IComponentDialogProps> = (props) => {
  const theme = useTheme();

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (!props.open) {
    return <></>;
  }

  return (
    <Box>
      <Dialog
        fullScreen={fullScreen}
        maxWidth="xl"
        open={props.open}
        aria-labelledby="component-dialog-title"
        aria-describedby="component-dialog-description">
        <DialogTitle id="component-dialog-title">{props.dialogTitle}</DialogTitle>
        <DialogContent>
          <Box py={2}>{props.children}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose} color="primary" variant="contained" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComponentDialog;
