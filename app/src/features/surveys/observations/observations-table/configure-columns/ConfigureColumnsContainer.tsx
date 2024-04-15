import { mdiTableEdit } from '@mdi/js';
import Icon from '@mdi/react';
import { Button } from '@mui/material';
import { useState } from 'react';
import ConfigureColumnsDialog from './dialog/ConfigureColumnsDialog';

export enum ConfigureColumnsViewEnum {
  MEASUREMENTS = 'MEASUREMENTS',
  GENERAL = 'GENERAL',
  ENVIRONMENT = 'ENVIRONMENT'
}

const ConfigureColumnsContainer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        color="primary"
        variant="outlined"
        data-testid="observation-measurements-button"
        onClick={() => setIsOpen(true)}
        startIcon={<Icon style={{ marginTop: '2px' }} path={mdiTableEdit} size={1} />}
        aria-label="Add Measurements">
        Configure
      </Button>
      <ConfigureColumnsDialog
        onClose={() => {
          setIsOpen(false);
        }}
        open={isOpen}
        onSave={() => {}}
      />
    </>
  );
};

export default ConfigureColumnsContainer;
