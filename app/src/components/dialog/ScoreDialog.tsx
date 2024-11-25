import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { MarkdownScoreButtons } from 'components/buttons/MarkdownScoreButtons';
import { ReactNode } from 'react';

export interface IScoreDialogProps {
  /**
   * optional component to render underneath the dialog text.
   *
   * @type {ReactNode}
   * @memberof IScoreDialogProps
   */
  dialogContent?: ReactNode;
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IScoreDialogProps
   */
  dialogTitle: string;
  /**
   * The dialog window body text.
   *
   * @type {string}
   * @memberof IScoreDialogProps
   */
  dialogText: string;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IScoreDialogProps
   */
  open: boolean;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IScoreDialogProps
   */
  onClose: () => void;
  /**
   * Callback fired if the 'Ok' button is clicked.
   *
   * @memberof IScoreDialogProps
   */
  onOk: () => Promise<void> | void;

  /**
   * Indicates whether the user has already submitted before, in which case they cannot submit again
   *
   * @memberof IScoreDialogProps
   */
  hasSubmitted?: boolean;

  /**
   * Callback fired if the user scores dialog content
   *
   * @memberof IScoreDialogProps
   */
  onSubmit?: (score: number) => Promise<void> | void;

  /**
   * The ok button label.
   *
   * @type {string}
   * @memberof IScoreDialogProps
   */
  okButtonLabel?: string;

  /**
   * The no button label.
   *
   * @type {string}
   * @memberof IScoreDialogProps
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
   * @memberof IScoreDialogProps
   */
  isLoading?: boolean;
}

/**
 * A dialog for displaying content and letting the user upscore or downscore to content.
 *
 * @param {*} props
 * @return {*}
 */
const ScoreDialog = (props: IScoreDialogProps) => {
  if (!props.open) {
    return <></>;
  }

  return (
    <Dialog
      fullWidth
      open={props.open}
      maxWidth="md"
      onClose={props.onClose}
      data-testid="ok-no-dialog"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      {props.dialogTitle && <DialogTitle id="alert-dialog-title">{props.dialogTitle}</DialogTitle>}
      <DialogContent>
        {props.dialogText && <DialogContentText id="alert-dialog-description">{props.dialogText}</DialogContentText>}
        {props.dialogContent}
      </DialogContent>
      <DialogActions>
        {props.onSubmit && (
          <Box mr={3}>
            {props.hasSubmitted ? (
              <Typography color="textSecondary">Thanks for your feedback!</Typography>
            ) : (
              <MarkdownScoreButtons
                positiveText="This is helpful"
                negativeText="This is confusing"
                handleSubmit={props.onSubmit}
              />
            )}
          </Box>
        )}
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

export default ScoreDialog;
