import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Button } from '@mui/material';
import { ReactNode, useState } from 'react';

interface TextInputToggleProps {
  label: string;
  children: ReactNode;
  //Additional props if you want the parent component to have control of the toggle state
  toggleProps?: {
    handleToggle: () => void;
    toggleState: boolean;
  };
}

/**
 * Renders a toggle input. Button with label -> any component
 * Used in animal form for toggle comment inputs
 *
 * @param {TextInputToggleProps}
 * @return {*}
 */

const TextInputToggle = ({ children, label, toggleProps }: TextInputToggleProps) => {
  const [showInput, setShowInput] = useState(false);
  const toggleInput = () => {
    setShowInput((s) => !s);
  };

  const canShowInput = toggleProps?.toggleState === undefined ? showInput : toggleProps?.toggleState;

  return (
    <div>
      {!canShowInput ? (
        <Button
          onClick={toggleProps?.handleToggle ?? toggleInput}
          startIcon={<Icon path={mdiPlus} size={0.8} />}
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
