import Button, { ButtonProps } from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { IBaseDialogProps } from 'contexts/dialogContext';
import React, { ReactNode } from 'react';

export interface IYesNoDialogProps extends IBaseDialogProps {
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

  /**
   * optional component to render underneath the dialog text.
   *
   * @type {ReactNode}
   * @memberof IYesNoDialogProps
   */
  dialogContent?: ReactNode;
}

/**
 * A dialog for displaying a title + message (typically a question), and giving the user the option to say
 * `Yes` or `No`.
 *
 * @param {*} props
 * @return {*}
 */
const YesNoDialog = (props: IYesNoDialogProps) => {
  return (
    <Dialog
      fullWidth
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
