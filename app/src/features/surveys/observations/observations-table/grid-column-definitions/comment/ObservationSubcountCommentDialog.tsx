import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

interface IObservationSubcountCommentDialogProps {
  /**
   * The initial value of the comment.
   *
   * @type {string}
   */
  initialValue?: string;
  /**
   * Set to 'true' to open the dialog.
   *
   * @type {boolean}
   */
  open: boolean;
  /**
   * Callback fired when the close button is clicked.
   *
   * @type {() => void}
   */
  handleClose: () => void;
}

/**
 * Dialog for displaying comments of an observation.
 *
 * @param {IObservationSubcountCommentDialogProps} props
 * @returns {*} {JSX.Element}
 */
export const ObservationSubcountCommentDialog = (props: IObservationSubcountCommentDialogProps) => {
  const { initialValue, open, handleClose } = props;

  return (
    <Dialog
      maxWidth="xl"
      open={open}
      onClose={handleClose}
      aria-labelledby="component-dialog-title"
      aria-describedby="component-dialog-description">
      <DialogTitle id="component-dialog-title">Comment</DialogTitle>
      <DialogContent>{initialValue}</DialogContent>
      <DialogActions sx={{ pt: 0 }}>
        <Button
          onClick={() => {
            // Close the dialog and reset the comment to the initial value
            props.handleClose();
          }}
          color="primary"
          variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
