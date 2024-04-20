import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import { MeasurementsDialog } from 'features/surveys/observations/observations-table/configure-table/measurements/dialog/MeasurementsDialog';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';

export interface IMeasurementsButtonProps {
  disabled: boolean;
  /**
   * The selected measurements.
   *
   * @type {CBMeasurementType[]}
   * @memberof IMeasurementsButtonProps
   */
  selectedMeasurements: CBMeasurementType[];
  /**
   * Callback fired on save.
   *
   * @memberof IMeasurementsButtonProps
   */
  onAddMeasurements: (measurements: CBMeasurementType[]) => void;
}

/**
 * Renders a dialog to manage measurements, and a button to open the dialog.
 *
 * @param {IMeasurementsButtonProps} props
 * @return {*}
 */
export const MeasurementsButton = (props: IMeasurementsButtonProps) => {
  const { disabled, selectedMeasurements, onAddMeasurements } = props;

  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        color="primary"
        variant="outlined"
        data-testid="observation-measurements-button"
        onClick={() => setOpen(true)}
        startIcon={<Icon path={mdiPlus} size={0.75} />}
        aria-label="Add Measurements"
        disabled={disabled}>
        Add Measurements
      </Button>
      <MeasurementsDialog
        selectedMeasurements={selectedMeasurements}
        open={open}
        onSave={(measurements) => {
          onAddMeasurements(measurements);
          setOpen(false);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </>
  );
};