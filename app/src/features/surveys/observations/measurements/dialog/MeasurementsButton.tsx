import Button from '@mui/material/Button';
import { MeasurementsDialog } from 'features/surveys/observations/measurements/dialog/MeasurementsDialog';
import { Measurement } from 'hooks/cb_api/useLookupApi';
import { useState } from 'react';

export interface IMeasurementsButtonProps {
  /**
   * The current survey id.
   *
   * @type {number}
   * @memberof IMeasurementsButtonProps
   */
  surveyId: number;
  /**
   * Callback fired on save.
   *
   * @memberof IMeasurementsButtonProps
   */
  onSave: (measurements: Measurement[]) => void;
}

/**
 * Renders a dialog to manage measurements, and a button to open the dialog.
 *
 * @param {IMeasurementsButtonProps} props
 * @return {*}
 */
export const MeasurementsButton = (props: IMeasurementsButtonProps) => {
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
      <MeasurementsDialog
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
