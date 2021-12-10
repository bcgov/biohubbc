import Button, { ButtonProps } from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React, { ReactNode } from 'react';

export interface IYesNoDialogProps {
  /**
   * optional component to render underneath the dialog text.
   *
   * @type {ReactNode}
   * @memberof IYesNoDialogProps
   */
  dialogContent?: ReactNode;
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

  /**
   * The yes button label.
   *
   * @type {string}
   * @memberof IYesNoDialogProps
   */
  yesButtonLabel?: string;

  /**
   * The no button label.
   *
   * @type {string}
   * @memberof IYesNoDialogProps
   */
  noButtonLabel?: string;

  /**
   * Optional yes-button props
   *
   * @type {Partial<ButtonProps>}
   * @memberof IYesNoDialogProps
   */
  yesButtonProps?: Partial<ButtonProps>;

  /**
   * Optional no-button props
   *
   * @type {Partial<ButtonProps>}
   * @memberof IYesNoDialogProps
   */
  noButtonProps?: Partial<ButtonProps>;
}

/**
 * A dialog for displaying a title + message (typically a question), and giving the user the option to say
 * `Yes` or `No`.
 *
 * @param {*} props
 * @return {*}
 */
const YesNoDialog: React.FC<IYesNoDialogProps> = (props) => {
  if (!props.open) {
    return <></>;
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      data-testid="yes-no-dialog"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{props.dialogTitle}</DialogTitle>
      <DialogContent>
        {props.dialogText && <DialogContentText id="alert-dialog-description">{props.dialogText}</DialogContentText>}
        {props.dialogContent}
      </DialogContent>
      <DialogActions>
        <Button
          data-testid="yes-button"
          onClick={props.onYes}
          color="primary"
          variant="contained"
          {...props.yesButtonProps}>
          {props.yesButtonLabel ? props.yesButtonLabel : 'Yes'}
        </Button>

        <Button
          data-testid="no-button"
          onClick={props.onNo}
          color="primary"
          variant="outlined"
          {...props.noButtonProps}>
          {props.noButtonLabel ? props.noButtonLabel : 'No'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default YesNoDialog;
