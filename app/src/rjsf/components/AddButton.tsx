import React from 'react';

import { AddButtonProps } from '@rjsf/core';

import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';

const AddButton: React.FC<AddButtonProps> = (props) => (
  <Button variant="contained" {...props} color="primary">
    <AddIcon /> Add Item
  </Button>
);

export default AddButton;
