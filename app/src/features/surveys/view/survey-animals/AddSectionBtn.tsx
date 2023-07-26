import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Button } from '@mui/material';
import React from 'react';

interface AddSectionBtnProps {
  handleAdd: () => void;
  label: string;
}

const AddSectionBtn = ({ handleAdd, label }: AddSectionBtnProps) => {
  return (
    <Button
      onClick={handleAdd}
      startIcon={<Icon path={mdiPlus} size={1} />}
      variant="outlined"
      size="small"
      color="primary">
      {label}
    </Button>
  );
};

export default AddSectionBtn;
