import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { MeasurementsList } from 'features/surveys/observations/measurements/list/MeasurementsList';
import { MeasurementsSearch } from 'features/surveys/observations/measurements/search/MeasurementsSearch';
import { Measurement } from 'hooks/cb_api/useLookupApi';
import { useState } from 'react';

export interface IrementsDialogProps {
  /**
   * Controls whether the dialog is open or not.
   *
   * @type {boolean}
   * @memberof IrementsDialogProps
   */
  open: boolean;
  /**
   * The selected measurements.F
   *
   * @type {Measurement[]}
   * @memberof IrementsDialogProps
   */
  selectedMeasurements: Measurement[];
  /**
   * Callback fired on save.
   *
   * @memberof IrementsDialogProps
   */
  onSave: (measurements: Measurement[]) => void;
  /**
   * Callback fired on cancel.
   *
   * @memberof IrementsDialogProps
   */
  onCancel: () => void;
}

/**
 * Renders a dialog to manage measurements.
 *
 * @param {IrementsDialogProps} props
 * @return {*}
 */
export const MeasurementsDialog = (props: IrementsDialogProps) => {
  const { open, selectedMeasurements: initialSelectedMeasurements, onSave, onCancel } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedMeasurements, setSelectedMeasurements] = useState<Measurement[]>(initialSelectedMeasurements);

  const onRemove = (measurementToRemove: Measurement) => {
    setSelectedMeasurements((currentMeasurements) =>
      currentMeasurements.filter((currentMeasurement) => currentMeasurement.uuid !== measurementToRemove.uuid)
    );
  };

  const onSelectOptions = (measurementsToAdd: Measurement[]) => {
    setSelectedMeasurements((currentMeasurements) =>
      [...currentMeasurements, ...measurementsToAdd].filter(
        (item1, index, self) => index === self.findIndex((item2) => item2.uuid === item1.uuid)
      )
    );
  };

  if (!open) {
    return <></>;
  }

  return (
    <Dialog
      data-testid="observation-measurements-dialog"
      fullScreen={fullScreen}
      maxWidth="xl"
      open={open}
      aria-labelledby="observation-measurements-dialog-title">
      <DialogTitle id="observation-measurements-dialog-title">Add Observation Measurements</DialogTitle>
      <DialogContent>
        <MeasurementsSearch selectedMeasurements={selectedMeasurements} onSelectOptions={onSelectOptions} />
        <MeasurementsList selectedMeasurements={selectedMeasurements} onRemove={onRemove} />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={false}
          disabled={false}
          onClick={() => onSave(selectedMeasurements)}
          color="primary"
          variant="contained"
          autoFocus
          data-testid="observation-measurements-dialog-add-button">
          Add
        </LoadingButton>
        <Button
          onClick={onCancel}
          color="primary"
          variant="outlined"
          data-testid="observation-measurements-dialog-cancel-button">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
