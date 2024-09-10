import { mdiKeyWireless } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import { TelemetryDeviceKeysDialog } from 'features/surveys/telemetry/device-keys/TelemetryDeviceKeysDialog';
import { useState } from 'react';

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

      <IconButton onClick={() => setOpen(true)} disabled={disabled} aria-label="Manage telemetry device keys">
        <Icon path={mdiKeyWireless} size={1} />
      </IconButton>
    </>
  );
};
