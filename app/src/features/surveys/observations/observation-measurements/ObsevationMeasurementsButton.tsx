import Button from '@mui/material/Button';
import { ObservationMeasurementsDialog } from 'features/surveys/observations/observation-measurements/ObservationMeasurementsDialog';
import { useState } from 'react';

export interface IObservationMeasurementsButtonProps {
  surveyId: number;
}

export const ObservationMeasurementsButton = (props: IObservationMeasurementsButtonProps) => {
  const [open, setOpen] = useState(false);

  const onSave = async () => {};

  const onCancel = async () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        color="primary"
        variant="contained"
        data-testid="observation-measurements-button"
        onClick={() => setOpen(true)}
        autoFocus>
        Manage Columns
      </Button>
      <ObservationMeasurementsDialog open={open} surveyId={props.surveyId} onSave={onSave} onCancel={onCancel} />
    </>
  );
};
