import TextField from '@mui/material/TextField';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { useObservationsTableContext } from 'hooks/useContext';
import { useEffect, useState } from 'react';

interface IObservationCommentDialogProps {
  open: boolean;
  onClose: (value: string | null) => void;
}

export const ObservationCommentDialog = (props: IObservationCommentDialogProps) => {
  const observationsTableContext = useObservationsTableContext();

  // initialize the state with the selected row's value
  const [comment, setComment] = useState<string | null>(
    observationsTableContext.savedRows.find((row) => Number(row.id) == observationsTableContext.commentDialogRowId)
      ?.observation_date ?? null
  );

  console.log(observationsTableContext.commentDialogRowId);

  useEffect(() => {
    setComment(
      observationsTableContext.savedRows.find((row) => Number(row.id) == observationsTableContext.commentDialogRowId)
        ?.observation_date ?? null
    );
  }, [observationsTableContext.commentDialogRowId]);

  return (
    <ComponentDialog
      dialogTitle="Add Comment"
      open={props.open}
      onClose={() => props.onClose(comment)}
      closeButtonLabel="Save & close">
      <TextField
        fullWidth
        placeholder="Add a comment to the observation"
        value={comment}
        rows={4}
        multiline
        onChange={(event) => setComment(event.target.value)}
      />
    </ComponentDialog>
  );
};
