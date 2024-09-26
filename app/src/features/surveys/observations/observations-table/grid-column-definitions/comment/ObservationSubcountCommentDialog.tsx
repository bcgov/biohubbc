import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
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

  const [comment, setComment] = useState(params?.value ?? '');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.currentTarget.value);
  };

  useEffect(() => {
    setComment(params?.value);
  }, [params?.value]);

  const handleSave = () => {
    if (params) {
      // Update the row in the DataGrid
      params.api.setEditCellValue({ id: params.id, field: params.field, value: comment });
    }
    observationsTableContext.setCommentDialogParams(null);
  };

  return (
    <Dialog
      maxWidth="xl"
      open={props.open}
      onClose={() => observationsTableContext.setCommentDialogParams(null)}
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
          onChange={handleChange}
          autoFocus
        />
      </DialogContent>
      <DialogActions sx={{ pt: 0 }}>
        <LoadingButton onClick={handleSave} color="primary" variant="contained">
          Save & close
        </LoadingButton>
        <Button
          onClick={() => observationsTableContext.setCommentDialogParams(null)}
          color="primary"
          variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
