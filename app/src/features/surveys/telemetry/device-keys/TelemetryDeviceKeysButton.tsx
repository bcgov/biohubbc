import Button from '@mui/material/Button';
import { TelemetryDeviceKeysDialog } from 'features/surveys/telemetry/device-keys/TelemetryDeviceKeysDialog';
import { useState } from 'react';

export interface ITelemetryDeviceKeysButtonProps {
  /**
   * Controls the disabled state of the button.
   *
   * @type {boolean}
   * @memberof ITelemetryDeviceKeysButtonProps
   */
  disabled: boolean;
}

export const TelemetryDeviceKeysButton = (props: ITelemetryDeviceKeysButtonProps) => {
  const { disabled } = props;

  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Button variant="outlined" color="primary" onClick={() => setOpen(true)} disabled={disabled}>
        Manage Device Keys
      </Button>
      <TelemetryDeviceKeysDialog
        open={open}
        onSave={() => {
          setOpen(false);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </>
  );
};
