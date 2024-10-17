import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
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
    <>
      <Alert variant={variant} severity={severity} sx={{ flex: '1 1 auto' }}>
        <AlertTitle>{title}</AlertTitle>
        {text}
      </Alert>
    </>
  );
};

AlertBar.defaultProps = {
  severity: 'success',
  variant: 'standard',
  title: '',
  text: ''
};

export default AlertBar;
