import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ReactNode } from 'react';

export interface IInfoDialogProps {
  /**
   * optional component to render underneath the dialog text.
   *
   * @type {ReactNode}
   * @memberof IInfoDialogProps
   */
  dialogContent?: ReactNode;
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IInfoDialogProps
   */
  dialogTitle: string;
  /**
   * The dialog window body text.
   *
   * @type {string}
   * @memberof IInfoDialogProps
   */
  dialogText: string;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IInfoDialogProps
   */
  open: boolean;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IInfoDialogProps
   */
  onClose: () => void;
  /**
   * Callback fired if the 'Ok' button is clicked.
   *
   * @memberof IInfoDialogProps
   */
  onOk: () => Promise<void> | void;

  /**
   * The ok button label.
   *
   * @type {string}
   * @memberof IInfoDialogProps
   */
  okButtonLabel?: string;

  /**
   * The no button label.
   *
   * @type {string}
   * @memberof IInfoDialogProps
   */
  noButtonLabel?: string;

  /**
   * Optional ok-button props
   *
   * @type {any}
   * Needed fix: Add correct hardcoded type.
   * Note: LoadingButtonProps causes build compile issue
   * https://github.com/mui/material-ui/issues/30038
   */
  okButtonProps?: any;

  /**
   * Optional no-button props
   *
   * @type {any}
   * Needed fix: Add correct hardcoded type.
   * Note: LoadingButtonProps causes build compile issue
   * https://github.com/mui/material-ui/issues/30038
   */
  noButtonProps?: any;

  /**
   * Optional Boolean to state if button should be loading
   *
   * @type {boolean}
   * @memberof IInfoDialogProps
   */
  isLoading?: boolean;
}

/**
 * A dialog for displaying a title + message (typically a question), and giving the user the option to say
 * `Ok` or `No`.
 *
 * @param {*} props
 * @return {*}
 */
const InfoDialog = (props: IInfoDialogProps) => {
  if (!props.open) {
    return <></>;
  }

  return (
    <Dialog
      fullWidth
      open={props.open}
      maxWidth='md'
      onClose={props.onClose}
      data-testid="ok-no-dialog"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{props.dialogTitle}</DialogTitle>
      <DialogContent>
        {props.dialogText && <DialogContentText id="alert-dialog-description">{props.dialogText}</DialogContentText>}
        {props.dialogContent}
      </DialogContent>
      <DialogActions>
        <LoadingButton
          data-testid="ok-button"
          onClick={props.onOk}
          color="primary"
          variant="contained"
          fontWeight={700}
          {...props.okButtonProps}>
          {props.okButtonLabel ? props.okButtonLabel : 'Ok'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default InfoDialog;
