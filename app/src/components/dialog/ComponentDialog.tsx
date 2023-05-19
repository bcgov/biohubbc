import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { IBaseDialogProps } from 'contexts/dialogContext';
import React from 'react';

export interface IComponentDialogProps extends IBaseDialogProps {
  /**
   * `Dialog` props passthrough.
   *
   * @type {Partial<DialogProps>}
   * @memberof IComponentDialogProps
   */
  dialogProps?: Partial<DialogProps>;
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

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="xl"
      open={props.open}
      aria-labelledby="component-dialog-title"
      aria-describedby="component-dialog-description"
      {...props.dialogProps}>
      <DialogTitle id="component-dialog-title">{props.dialogTitle}</DialogTitle>
      
      <DialogContent>{props.children}</DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary" variant="contained" autoFocus>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComponentDialog;
