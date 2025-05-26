import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button, { ButtonProps } from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';

interface AddSurveyUsersProps extends ButtonProps {
  to?: string;
  label: string;
}

export const AddSurveyUsers = ({ to, label, ...props }: AddSurveyUsersProps) => (
  <>
    {to ? (
      <Button
        variant="contained"
        color="primary"
        startIcon={<Icon path={mdiPlus} size={1} />}
        component={RouterLink}
        to={to}
        {...props}>
        {label}
      </Button>
    ) : (
      <Button variant="contained" color="primary" startIcon={<Icon path={mdiPlus} size={1} />} {...props}>
        {label}
      </Button>
    )}
  </>
);
