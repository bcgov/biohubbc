import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Button } from '@mui/material';
import React, { ReactNode, useState } from 'react';

interface TextInputToggleProps {
  label: string;
  children: ReactNode;
}
const TextInputToggle = ({ children, label }: TextInputToggleProps) => {
  const [showInput, setShowInput] = useState(false);
  const toggleInput = () => {
    setShowInput((s) => !s);
  };
  return (
    <div>
      {!showInput ? (
        <Button
          onClick={toggleInput}
          startIcon={<Icon path={mdiPlus} size={0.6} />}
          variant="text"
          sx={{ textTransform: 'none' }}>
          {label}
        </Button>
      ) : (
        children
      )}
    </div>
  );
};

export default TextInputToggle;
