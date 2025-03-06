import { mdiKeyVariant } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { TelemetryDeviceKeysDialog } from './TelemetryDeviceKeysDialog';

export interface ITelemetryDeviceKeysButtonProps {
  /**
   * Controls the disabled state of the button.
   *
   * @type {boolean}
   * @memberof ITelemetryDeviceKeysButtonProps
   */
  disabled?: boolean;
}

export const TelemetryDeviceKeysButton = (props: ITelemetryDeviceKeysButtonProps) => {
  const { disabled } = props;

  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <TelemetryDeviceKeysDialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      />

      <Button
        variant="outlined"
        color="primary"
        onClick={() => setOpen(true)}
        disabled={disabled}
        aria-label="Manage telemetry device keys"
        startIcon={<Icon path={mdiKeyVariant} size={1} />}>
        Device Keys
      </Button>
    </>
  );
};
