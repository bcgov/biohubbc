import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button, { ButtonProps } from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';

interface CreateButtonProps extends ButtonProps {
  to: string;
  label: string;
}

export const CreateButton = ({ to, label, ...props }: CreateButtonProps) => (
  <Button
    variant="contained"
    color="primary"
    startIcon={<Icon path={mdiPlus} size={1} />}
    component={RouterLink}
    to={to}
    {...props}>
    {label}
  </Button>
);
