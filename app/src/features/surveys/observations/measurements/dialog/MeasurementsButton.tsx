import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import { MeasurementsDialog } from 'features/surveys/observations/measurements/dialog/MeasurementsDialog';
import { Measurement } from 'hooks/cb_api/useLookupApi';
import { useState } from 'react';

export interface IMeasurementsButtonProps {
  disabled: boolean;
  /**
   * The selected measurements.
   *
   * @type {Measurement[]}
   * @memberof IMeasurementsButtonProps
   */
  selectedMeasurements: Measurement[];
  /**
   * Callback fired on save.
   *
   * @memberof IMeasurementsButtonProps
   */
  onAddMeasurements: (measurements: Measurement[]) => void;
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