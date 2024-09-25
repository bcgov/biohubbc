import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useObservationsTableContext } from 'hooks/useContext';
import React, { useEffect, useState } from 'react';

interface IObservationSubcountCommentDialogProps {
  open: boolean;
}

/**
 * Dialog for adding comments to an observation.
 *
 * @param props
 * @returns JSX.Element or null
 */
export const ObservationSubcountCommentDialog = (props: IObservationSubcountCommentDialogProps) => {
  const observationsTableContext = useObservationsTableContext();

  const params = observationsTableContext.commentDialogParams;

  const [comment, setComment] = useState(params?.value);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.currentTarget.value);
  };

  useEffect(() => {
    setComment(params?.value);
  }, [params?.id]);

  const handleSave = () => {
    if (params) {
      console.log(comment);
      // Update the row in the DataGrid
      params.api.setEditCellValue({ id: params.id, field: params.field, value: comment });
    }
    observationsTableContext.closeCommentDialog();
  };

  return (
    <Dialog
      maxWidth="md"
      open={props.open}
      onClose={observationsTableContext.closeCommentDialog}
      aria-labelledby="component-dialog-title"
      aria-describedby="component-dialog-description">
      <DialogTitle id="component-dialog-title">Add Comment</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Add a comment to the observation"
          value={comment}
          rows={4}
          multiline
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <LoadingButton onClick={handleSave} color="primary" variant="contained" autoFocus>
          Save & close
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
