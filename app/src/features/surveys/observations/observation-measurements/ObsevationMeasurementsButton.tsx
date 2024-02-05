import Button from '@mui/material/Button';
import { ObservationMeasurementsDialog } from 'features/surveys/observations/observation-measurements/ObservationMeasurementsDialog';
import { Measurement } from 'hooks/cb_api/useLookupApi';
import { useState } from 'react';

export interface IObservationMeasurementsButtonProps {
  surveyId: number;
  onSave: (measurements: Measurement[]) => void;
}

export const ObservationMeasurementsButton = (props: IObservationMeasurementsButtonProps) => {
  const { surveyId, onSave } = props;

  const [open, setOpen] = useState(false);

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
      <ObservationMeasurementsDialog
        open={open}
        surveyId={surveyId}
        onSave={(measurements) => {
          onSave(measurements);
          setOpen(false);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </>
  );
};
