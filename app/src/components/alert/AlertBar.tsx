import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import React, { useState } from 'react';

interface IAlertBarProps {
  severity: 'error' | 'warning' | 'info' | 'success';
  variant: 'filled' | 'outlined' | 'standard';
  title: string;
  text: string;
}

const AlertBar: React.FC<IAlertBarProps> = (props) => {
  const { severity, variant, title, text } = props;
  const [forceAlertClose] = useState(false);

  if (forceAlertClose) {
    // User has manually closed the banner
    return <></>;
  }

  return (
    <Box mb={3}>
      <Alert
        variant={variant}
        severity={severity}
        // action={
        //   <IconButton color="inherit" onClick={() => setForceAlertClose(false)}>
        //     <Icon path={mdiClose} size={1} />
        //   </IconButton>
        // }
      >
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
