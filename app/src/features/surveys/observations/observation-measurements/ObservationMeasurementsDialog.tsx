import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { MeasurementsList } from 'features/surveys/observations/observation-measurements/MeasurementsList';
import { MeasurementsSearch } from 'features/surveys/observations/observation-measurements/MeasurementsSearch';
import { Measurement } from 'hooks/cb_api/useLookupApi';
import { useState } from 'react';

export interface IObservationMeasurementsDialogProps {
  surveyId: number;
  open: boolean;
  onSave: (measurements: Measurement[]) => void;
  onCancel: () => void;
}

export const ObservationMeasurementsDialog = (props: IObservationMeasurementsDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  const onRemove = (measurementToRemove: Measurement) => {
    setMeasurements((currentMeasurements) =>
      currentMeasurements.filter((currentMeasurement) => currentMeasurement.uuid !== measurementToRemove.uuid)
    );
  };

  if (!props.open) {
    return <></>;
  }

  return (
    <Dialog
      data-testid="observation-measurements-dialog"
      fullScreen={fullScreen}
      maxWidth="xl"
      open={props.open}
      aria-labelledby="observation-measurements-dialog-title">
      <DialogTitle id="observation-measurements-dialog-title">Observation Measurements</DialogTitle>
      <DialogContent>
        <MeasurementsSearch
          measurements={measurements}
          onChange={(measurementsToAdd) =>
            setMeasurements((currentMeasurements) => [...currentMeasurements, ...measurementsToAdd])
          }
        />
        <MeasurementsList measurements={measurements} onRemove={onRemove} />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={false}
          disabled={false}
          onClick={() => props.onSave(measurements)}
          color="primary"
          variant="contained"
          autoFocus
          data-testid="observation-measurements-add-button">
          Add
        </LoadingButton>
        <Button
          onClick={props.onCancel}
          color="primary"
          variant="outlined"
          data-testid="observation-measurements-cancel-button">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
