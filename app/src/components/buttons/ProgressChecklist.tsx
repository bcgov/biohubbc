import { mdiFormatListChecks } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton } from '@mui/material';
import { ChecklistDialog } from 'features/surveys/components/checklist/ChecklistHandler';
import React, { useState } from 'react';

const Checklist: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const openChecklist = () => setDialogOpen(true);
  const closeChecklist = () => setDialogOpen(false);

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 15,
          right: 15,
          zIndex: 1000
        }}>
        <IconButton
          onClick={openChecklist}
          sx={{
            padding: '10px',
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: '5px',
            '&:hover': {
              backgroundColor: '#f0f0f0'
            }
          }}>
          <Icon path={mdiFormatListChecks} size={1} />
        </IconButton>
      </Box>

      {/* Render the dialog when the button is clicked */}
      <ChecklistDialog open={isDialogOpen} onClose={closeChecklist} />
    </>
  );
};

export default Checklist;
