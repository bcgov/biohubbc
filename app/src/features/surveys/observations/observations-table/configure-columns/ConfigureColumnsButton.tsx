import { mdiTableEdit } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import ConfigureColumnsDialog from './ConfigureColumnsDialog';

export enum ConfigureColumnsViewEnum {
  MEASUREMENTS = 'MEASUREMENTS',
  GENERAL = 'GENERAL',
  ENVIRONMENT = 'ENVIRONMENT'
}

const ConfigureColumnsButton = () => {
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
      <Box maxWidth="xl">
        <ConfigureColumnsDialog
          onClose={() => {
            setIsOpen(false);
          }}
          open={isOpen}
          onSave={() => {}}
        />
      </Box>
    </>
  );
};

export default ConfigureColumnsButton;
