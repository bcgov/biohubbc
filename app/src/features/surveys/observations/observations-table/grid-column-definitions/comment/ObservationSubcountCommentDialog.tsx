import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

interface IObservationSubcountCommentDialogProps {
  /**
   * The initial value of the comment.
   *
   * @type {string}
   */
  initialValue?: string;
  /**
   * The open state of the dialog.
   *
   * @type {boolean}
   */
  open: boolean;
  /**
   * Callback to close the dialog.
   *
   * @type {(value?: string) => void}
   */
  handleClose: () => void;
  /**
   * Callback to save the comment.
   *
   * @type {(value?: string) => void}
   */
  handleSave: (value?: string) => void;
}

/**
 * Dialog for adding comments to an observation.
 *
 * @param {IObservationSubcountCommentDialogProps} props
 * @returns {*} {JSX.Element}
 */
export const ObservationSubcountCommentDialog = (props: IObservationSubcountCommentDialogProps) => {
  // Hold the intial value in state so that we can reset the comment if the user cancels
  const [comment, setComment] = useState(props.initialValue);

  return (
    <Dialog
      maxWidth="xl"
      open={props.open}
      onClose={props.handleClose}
      aria-labelledby="component-dialog-title"
      aria-describedby="component-dialog-description">
      <DialogTitle id="component-dialog-title">Add Comment</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Add a comment to the observation"
          value={comment}
          sx={{ minWidth: '300px' }}
          rows={5}
          multiline
          onChange={(event) => setComment(event.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ pt: 0 }}>
        <LoadingButton
          onClick={() => {
            // Close the dialog and save the comment
            props.handleClose();
            props.handleSave(comment);
          }}
          color="primary"
          variant="contained">
          Save & close
        </LoadingButton>
        <Button
          onClick={() => {
            // Close the dialog and reset the comment to the initial value
            props.handleClose();
            setComment(props.initialValue);
          }}
          color="primary"
          variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
