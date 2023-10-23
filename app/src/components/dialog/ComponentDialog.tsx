import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { PropsWithChildren } from 'react';

export type IComponentDialogProps = PropsWithChildren<{
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
  /**
   * The close button label.
   *
   * @default 'Ok'
   * @type {string}
   * @memberof IComponentDialogProps
   */
  closeButtonLabel?: string;
  /**
   * `Dialog` props passthrough.
   *
   * @type {Partial<DialogProps>}
   * @memberof IComponentDialogProps
   */
  dialogProps?: Partial<DialogProps>;
}>;

/**
 * A dialog to wrap any component(s) that need to be displayed as a modal.
 *
 * Any component(s) passed in `props.children` will be rendered as the content of the dialog.
 *
 * @param {*} props
 * @return {*}
 */
const ComponentDialog = (props: IComponentDialogProps) => {
  const theme = useTheme();

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (!props.open) {
    return <></>;
  }

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
          {props.closeButtonLabel ? props.closeButtonLabel : 'Ok'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComponentDialog;
