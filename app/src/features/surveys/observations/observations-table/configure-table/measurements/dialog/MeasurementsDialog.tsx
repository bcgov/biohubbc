import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { MeasurementsList } from 'features/surveys/observations/observations-table/configure-table/measurements/list/MeasurementsList';
import { MeasurementsSearch } from 'features/surveys/observations/observations-table/configure-table/measurements/search/MeasurementsSearch';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';

export interface IMeasurementsDialogProps {
  /**
   * Controls whether the dialog is open or not.
   *
   * @type {boolean}
   * @memberof IMeasurementsDialogProps
   */
  open: boolean;
  /**
   * The selected measurements.
   *
   * @type {CBMeasurementType[]}
   * @memberof IMeasurementsDialogProps
   */
  selectedMeasurements: CBMeasurementType[];
  /**
   * Callback fired on save.
   *
   * @memberof IMeasurementsDialogProps
   */
  onSave: (measurements: CBMeasurementType[]) => void;
  /**
   * Callback fired on cancel.
   *
   * @memberof IMeasurementsDialogProps
   */
  onCancel: () => void;
}

/**
 * Renders a dialog to manage measurements.
 *
 * @param {IMeasurementsDialogProps} props
 * @return {*}
 */
export const MeasurementsDialog = (props: IMeasurementsDialogProps) => {
  const { open, selectedMeasurements: initialSelectedMeasurements, onSave, onCancel } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedMeasurements, setSelectedMeasurements] = useState<CBMeasurementType[]>(initialSelectedMeasurements);

  const onRemove = (measurementToRemove: CBMeasurementType) => {
    setSelectedMeasurements((currentMeasurements) =>
      currentMeasurements.filter(
        (currentMeasurement) => currentMeasurement.taxon_measurement_id !== measurementToRemove.taxon_measurement_id
      )
    );
  };

  const onSelectOptions = (measurementsToAdd: CBMeasurementType[]) => {
    setSelectedMeasurements((currentMeasurements) =>
      [...currentMeasurements, ...measurementsToAdd].filter(
        (item1, index, self) =>
          index === self.findIndex((item2) => item2.taxon_measurement_id === item1.taxon_measurement_id)
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
        <Button
          disabled={false}
          onClick={() => onSave(selectedMeasurements)}
          color="primary"
          variant="contained"
          autoFocus
          data-testid="observation-measurements-dialog-add-button">
          Add
        </Button>
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