import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import React from 'react';

interface IAlertBarProps {
  severity: 'error' | 'warning' | 'info' | 'success';
  variant: 'filled' | 'outlined' | 'standard';
  title: string;
  text: string | JSX.Element;
}

const AlertBar: React.FC<IAlertBarProps> = (props) => {
  const { severity, variant, title, text } = props;

  return (
    <Box mb={3}>
      <Alert variant={variant} severity={severity}>
        <AlertTitle>{title}</AlertTitle>
        {text}
      </Alert>
    </Box>
  );
};

AlertBar.defaultProps = {
  severity: 'success',
  variant: 'standard',
  title: '',
  text: ''
};

export default AlertBar;
