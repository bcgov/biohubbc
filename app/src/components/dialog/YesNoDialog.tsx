import { LoadingButton } from '@mui/lab';
import Button, { ButtonProps } from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React, { ReactNode, useState } from 'react';

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

  /**
   * Optional Boolean to state if button should be loading
   *
   * @type {boolean}
   * @memberof IYesNoDialogProps
   */
  isLoading?: boolean;
}

/**
 * A dialog for displaying a title + message (typically a question), and giving the user the option to say
 * `Yes` or `No`.
 *
 * @param {*} props
 * @return {*}
 */
const YesNoDialog: React.FC<IYesNoDialogProps> = (props) => {
  const [isLoading, setIsLoading] = useState(props.isLoading || false);

  if (!props.open) {
    return <></>;
  }

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
        <LoadingButton
          loading={isLoading}
          data-testid="yes-button"
          onClick={async () => {
            // loading state is set before submission to reflect user action immediately
            setIsLoading(true);
            await props.onYes();
            setIsLoading(false);
          }}
          color="primary"
          variant="contained"
          {...props.yesButtonProps}>
          {props.yesButtonLabel ? props.yesButtonLabel : 'Yes'}
        </LoadingButton>

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
