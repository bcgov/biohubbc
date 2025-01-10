import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiFormatListChecks } from '@mdi/js';
import { ChecklistDialog } from 'features/surveys/components/checklist/ChecklistHandler';

interface ChecklistProps {}

const Checklist: React.FC<ChecklistProps> = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const openChecklist = () => {
    setDialogOpen(true);
  };

  const closeChecklist = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 15,
          right: 15,
          zIndex: 1000,
        }}
      >
        <button
          onClick={openChecklist}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            backgroundColor: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          <Icon path={mdiFormatListChecks} size={1} style={{ marginRight: '8px' }} />
        </button>
      </div>

      {/* Render the dialog */}
      <ChecklistDialog open={isDialogOpen} onClose={closeChecklist} />
    </>
  );
};

export default Checklist;
